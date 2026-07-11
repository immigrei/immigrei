#!/usr/bin/env python3
"""
Refresh lib/data/sevp-schools.json from the official SEVP certified school list.

DHS republishes the list (PDF only) roughly monthly at:
  https://studyinthestates.dhs.gov/school-search
  → link "certified-school-list-MM-DD-YY.pdf"

Usage:
  pip install pdfplumber
  python3 scripts/parse-sevp-pdf.py certified-school-list-07-08-26.pdf 2026-07-08

The PDF is a fixed-column table, parsed at the character level (each glyph
assigned to a column by x position) because long school/city names physically
overlap the neighboring column and interleave with its text. Three overlap
cases are handled:
  - campus name into the Y/N flag columns → flag() picks the Y/N glyph
    nearest the flag's known x position;
  - city into the state column → fix_state() strips lowercase glyphs (city
    tails) and matches a valid code in the residue;
  - state into the campus-code column → leading code chars are reclaimed
    from the state column until the code validates.
Rows fix_state() can't untangle unambiguously live in OVERRIDES, hand-checked
against the official search (campus codes are stable across editions). After
a refresh, review the FIXED/UNRESOLVED lines on stderr and extend OVERRIDES.
"""
import json
import re
import sys
from collections import defaultdict

import pdfplumber

# column x boundaries: school, campus, F flag, M flag, city, state, code
BOUNDS = [(0, "school"), (245, "campus"), (383, "f"), (399, "m"),
          (413, "city"), (489, "state"), (510, "code")]

VALID = sorted(
    "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN "
    "MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA "
    "WV WI WY PR GU VI MP AS".split()
)
VALID_SET = set(VALID)

# Hand-verified city/state for rows where the city/state overlap is ambiguous.
OVERRIDES = {
    "BOS214F01341000": ("Newton Upper Falls", "MA"),
    "BUF214F00099006": ("North Chesterfield", "VA"),
    "WAS214F01288000": ("South Chesterfield", "VA"),
    "PHI214F10187004": ("North Hollywood", "CA"),
    "LOS214F02069000": ("North Hollywood", "CA"),
    "LOS214F01428000": ("North Hollywood", "CA"),
    "LOS214F59971000": ("North Hollywood", "CA"),
    "NYC214F01682000": ("Cold Spring Harbor", "NY"),
    "ATL214F01472015": ("Hilton Head Island", "SC"),
    "KAN214F00150004": ("Fort Leonard Wood", "MO"),
    "KAN214F00305002": ("Fort Leonard Wood", "MO"),
    "LOS214F01628006": ("San Juan Capistrano", "CA"),
    "SPM214F59561000": ("International Falls", "MN"),
    "SPM214F01214005": ("International Falls", "MN"),
    "BOS214F00918001": ("Manchester-By-The-Sea", "MA"),
    "LOS214F21142000": ("Palos Verdes Estates", "CA"),
    "WAS214F11036000": ("South Prince George", "VA"),
    "BUF214F00246000": ("Saint Bonaventure", "NY"),
    "PHO214F00648004": ("Colorado Springs", "CO"),
    "DEN214F58664000": ("Colorado Springs", "CO"),
    "DET214F56352000": ("Grosse Pointe Farms", "MI"),
    "LOS214F01481004": ("City Of Industry", "CA"),
}

CODE_RE = re.compile(r"[A-Z]{3}214[FM]\d{8,}")


def col_for(x):
    name = BOUNDS[0][1]
    for b, n in BOUNDS:
        if x >= b:
            name = n
    return name


def join_chars(chars):
    chars = sorted(chars, key=lambda c: c["x0"])
    out, prev = [], None
    for c in chars:
        if prev is not None and c["x0"] - prev > 1.2:
            out.append(" ")
        out.append(c["text"])
        prev = c["x1"]
    return "".join(out).strip()


def flag(chars, expected_x):
    """Y/N flag col may contain overflow chars from the campus name."""
    cs = [c for c in chars if c["text"] in "YN"]
    if len(cs) == 1:
        return cs[0]["text"]
    if cs:
        return min(cs, key=lambda c: abs(c["x0"] - expected_x))["text"]
    return ""


def fix_state(raw_state, city):
    """City overflow interleaves with the 2-letter state code. Lowercase chars
    belong to the city; then match a valid code greedily from the right."""
    s = raw_state.strip()
    if s.upper() in VALID_SET:
        return s.upper(), city, True
    lower = "".join(ch for ch in s if ch.islower())
    upper = "".join(ch for ch in s if not ch.islower() and not ch.isspace())
    if upper in VALID_SET:
        return upper, (city + lower), True
    t = s.replace(" ", "")
    for code in VALID:
        i = t.rfind(code[1])
        if i > 0:
            j = t.rfind(code[0], 0, i)
            if j >= 0 and code == t[j] + t[i]:
                leftover = t[:j] + t[j + 1:i] + t[i + 1:]
                if leftover.isalpha() and len(leftover) <= 4:
                    return code, city + leftover.lower(), False
    return None, city, False


def main(pdf_path, updated):
    rows, unresolved = [], 0
    with pdfplumber.open(pdf_path) as pdf:
        for pg in pdf.pages:
            lines = defaultdict(list)
            for c in pg.chars:
                lines[round(c["top"])].append(c)
            keys = sorted(lines)
            merged, cur = [], None
            for k in keys:
                if cur is not None and k - cur <= 2:
                    lines[cur].extend(lines.pop(k))
                else:
                    cur = k
                    merged.append(k)
            for k in merged:
                cols = defaultdict(list)
                for c in lines[k]:
                    cols[col_for(c["x0"])].append(c)
                code = join_chars(cols.get("code", [])).replace(" ", "")
                state_raw = join_chars(cols.get("state", []))
                # code may lose leading chars into the state col: reclaim
                # trailing chars from state until the code validates
                if not CODE_RE.fullmatch(code):
                    packed = state_raw.replace(" ", "")
                    for take in (3, 2, 1):
                        cand = packed[-take:] + code
                        if CODE_RE.fullmatch(cand):
                            code = cand
                            state_raw = packed[:-take]
                            break
                if not CODE_RE.fullmatch(code):
                    continue
                if code in OVERRIDES:
                    city, state = OVERRIDES[code]
                else:
                    state, city, clean = fix_state(
                        state_raw, join_chars(cols.get("city", [])))
                    city = city.title()
                    if state is None:
                        unresolved += 1
                        print(f"UNRESOLVED: {state_raw} | {city} | {code} — "
                              "add to OVERRIDES", file=sys.stderr)
                        continue
                    if not clean:
                        print(f"FIXED: {state_raw} -> {state} | {city} | {code}"
                              " — verify, consider OVERRIDES", file=sys.stderr)
                rows.append({
                    "school_name": join_chars(cols.get("school", [])),
                    "campus_name": join_chars(cols.get("campus", [])),
                    "accepts_f": flag(cols.get("f", []), 391.5) == "Y",
                    "accepts_m": flag(cols.get("m", []), 405.0) == "Y",
                    "city": city,
                    "state": state,
                    "campus_code": code,
                })

    print(f"parsed {len(rows)} campuses, {unresolved} unresolved", file=sys.stderr)
    out = "lib/data/sevp-schools.json"
    json.dump({"updated": updated,
               "source": "https://studyinthestates.dhs.gov/school-search",
               "campuses": rows},
              open(out, "w"), ensure_ascii=False)
    print(f"wrote {out}", file=sys.stderr)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])

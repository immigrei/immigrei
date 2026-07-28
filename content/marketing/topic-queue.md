# Topic queue — content agent backlog

Prioritized by search demand + product fit. The content agent pulls top-down.
Brazilians see USCIS status text in **English**, so status pages target the
English string and explain in PT-BR (bilingual format).

## Cluster 1 — USCIS status messages (highest priority)

| # | Query target (EN status string) | Status |
|---|---|---|
| 1 | Case Was Received | drafted |
| 2 | Request for Additional Evidence Was Sent | drafted |
| 3 | Case Was Approved | drafted |
| 4 | Card Was Mailed To Me | queued |
| 5 | Case Is Being Actively Reviewed By USCIS | queued |
| 6 | Fingerprint And Biometrics Appointment Was Scheduled | queued |
| 7 | Case Was Transferred And A New Office Has Jurisdiction | queued |
| 8 | Notice Of Intent To Deny Was Sent | queued |
| 9 | Case Was Denied | queued |
| 10 | New Card Is Being Produced | queued |

> Full dictionary of ~45 statuses in `lib/uscis-status-pt.ts` — each exact-match
> entry is a candidate page.

## Cluster 2 — Decoders & utilities

| # | Topic | Status |
|---|---|---|
| 1 | Receipt number prefix decoder (EAC/WAC/LIN/SRC/IOE/MSC) | drafted |
| 2 | Como ler o recibo I-797 | queued |
| 3 | Processing times: como consultar e interpretar | queued |

## Cluster 3 — Form lifecycles ("o que acontece depois de protocolar…")

| # | Form | Status |
|---|---|---|
| 1 | I-539 (extensão/mudança de status) | queued — strong product fit (B2→F1 kit) |
| 2 | I-130 (petição familiar) | queued |
| 3 | I-485 (ajuste de status) | queued |
| 4 | I-765 (autorização de trabalho) | queued |
| 5 | N-400 (naturalização) | queued |

## Rules
- Validate demand before mass-generating a cluster (Search Console + keyword
  tools). Thin PT-BR volume → go fully bilingual, rank on the EN string.
- New topic ideas get appended here with a one-line rationale, not built directly.

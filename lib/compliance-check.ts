import { readFile, readdir } from "fs/promises";
import path from "path";

/**
 * Compliance & fact-check gate for immigration content drafts.
 * Mirrors .claude/agents/compliance-fact-check.md as a real agentic tool-use
 * loop — Read/Grep/Glob run against the repo's bundled content/leis/ knowledge
 * base (read-only in the Vercel runtime, which is fine for these tools), and
 * WebFetch is restricted to the domains whitelisted in content/leis/fontes.md.
 *
 * This is NOT a second prompt hoping Claude "remembers" the rules — it is the
 * same check a human running the subagent locally would get, because it reads
 * the same files. A YMYL/UPL gate that doesn't actually check the knowledge
 * base isn't a gate.
 */

const REPO_ROOT = process.cwd();
const LEIS_DIR = path.join(REPO_ROOT, "content", "leis");

const ALLOWED_HOSTS = [
  "uscis.gov",
  "www.uscis.gov",
  "uscode.house.gov",
  "ecfr.gov",
  "www.ecfr.gov",
  "travel.state.gov",
  "fam.state.gov",
  "justice.gov",
  "www.justice.gov",
  "ice.gov",
  "www.ice.gov",
  "cbp.gov",
  "www.cbp.gov",
  "studyinthestates.dhs.gov",
];

export type ComplianceVerdictLevel = "PASS" | "PASS_WITH_FLAGS" | "FAIL";

export interface ComplianceFlag {
  type: "UPL" | "FACT" | "MISSING" | "BRAND";
  text: string;
  reason: string;
  suggestedFix?: string;
}

export interface ComplianceResult {
  verdict: ComplianceVerdictLevel;
  flags: ComplianceFlag[];
  verifiedClaims: string;
  unverified: string[];
  raw: string;
}

const SYSTEM_PROMPT = `Você é o revisor de compliance e fact-check da Immigrei para conteúdo de imigração.
Conteúdo de imigração é YMYL (Your Money or Your Life) e carrega risco de UPL
(unauthorized practice of law). Seu trabalho é pegar problemas ANTES do gate
humano, não substituí-lo.

Você recebe o texto de um rascunho (ainda não salvo em content/marketing/drafts/).
Você nunca edita o rascunho — você reporta; o content-agent corrige.

## Checagens (rode todas)

### 1. Alegações factuais
Para TODA alegação factual (taxas, prazos, timelines, estatísticas, efeitos legais):
- Rastreie até content/leis/ (a base de conhecimento fechada) usando as tools
  read_file / grep / glob, ou até uma fonte oficial da whitelist (use web_fetch
  apenas nesses domínios).
- Para significados de status USCIS, lib/uscis-status-pt.ts é canônico — o
  rascunho não pode contradizer a tradução do app.
- Priority dates do Visa Bulletin NUNCA devem aparecer hardcoded — elas vivem na
  tabela Supabase visa_bulletin.
- Uma alegação sem fonte, ou marcada <!-- VERIFY --> e não verificável na
  whitelist, é um FLAG (inclua a frase exata).

### 2. UPL / conselho personalizado
FAIL o rascunho se contiver diretivas ligadas ao caso do leitor:
- "você deve protocolar/aplicar/enviar X", "faça X no seu caso", "seu melhor
  caminho é X", ou qualquer imperativo em segunda pessoa sobre uma decisão de
  filing legal.
- Permitido: significado geral ("este status geralmente significa..."),
  descrições gerais de processo, e apontar para um profissional licenciado
  para decisões.

### 3. Elementos obrigatórios
- Disclaimer presente verbatim: "Este conteúdo é informativo e não constitui
  aconselhamento jurídico; consulte um advogado de imigração licenciado para o
  seu caso."
- Byline presente (Equipe Immigrei ou revisor credenciado).
- Toda estatística e citação tem link de fonte oficial inline.
- Nenhuma implicação de endosso ou afiliação com o USCIS.

### 4. Marca e linguagem
- Qualidade da explicação em PT-BR: acolhedor, direto, sem jargão jurídico sem
  gloss.
- String de status em inglês (se for página de status) aparece verbatim.

## Tools disponíveis
- read_file(path): lê um arquivo relativo à raiz do repo (ex: "content/leis/vistos/f1.md")
- grep(pattern, dir?): busca regex (case-insensitive) em content/leis/ e lib/uscis-status-pt.ts
- glob(pattern): lista arquivos em content/leis/ que casam com um padrão simples (ex: "vistos/*.md")
- web_fetch(url): busca uma URL — SÓ funciona em domínios da whitelist oficial

Use as tools quantas vezes precisar para verificar cada alegação antes de decidir o veredito.

## Formato de saída (condensado — isso é tudo que volta ao caller)

Termine sua resposta com EXATAMENTE este bloco (sem tool use depois dele):

VERDICT: PASS | PASS_WITH_FLAGS | FAIL
FLAGS:
- [UPL|FACT|MISSING|BRAND] <frase exata ou elemento> — <por quê> — <fix sugerido>
VERIFIED CLAIMS: <n> of <total>
UNVERIFIED (precisa checagem humana/fonte viva):
- <alegação> — <onde deveria existir uma fonte>

FAIL = qualquer violação de UPL, disclaimer faltando, ou fato contradito.
PASS_WITH_FLAGS = preciso mas tem alegações não verificadas ou problemas de marca.
PASS = tudo rastreado e limpo. Mesmo um PASS ainda exige o gate humano.`;

const TOOLS = [
  {
    name: "read_file",
    description: "Read a file's content, relative to the repo root (e.g. 'content/leis/vistos/f1.md')",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "Repo-relative file path" },
      },
      required: ["path"],
    },
  },
  {
    name: "grep",
    description: "Case-insensitive regex search across content/leis/ and lib/uscis-status-pt.ts",
    input_schema: {
      type: "object" as const,
      properties: {
        pattern: { type: "string", description: "Regex pattern to search for" },
      },
      required: ["pattern"],
    },
  },
  {
    name: "glob",
    description: "List files under content/leis/ matching a simple glob (e.g. 'vistos/*.md')",
    input_schema: {
      type: "object" as const,
      properties: {
        pattern: { type: "string", description: "Glob pattern relative to content/leis/" },
      },
      required: ["pattern"],
    },
  },
  {
    name: "web_fetch",
    description: "Fetch a URL's text content — only allowed for whitelisted official immigration-source domains",
    input_schema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "URL to fetch" },
      },
      required: ["url"],
    },
  },
];

const USCIS_STATUS_FILE = path.join(REPO_ROOT, "lib", "uscis-status-pt.ts");

/**
 * Resolve a path relative to `root` and guard against escaping it.
 * Checks for an exact match or a proper `root + separator` prefix — a plain
 * `startsWith(root)` is bypassable by a sibling directory that happens to
 * share `root`'s name as a prefix (e.g. root "/var/task" vs "/var/task-evil").
 */
function safeResolve(root: string, relativePath: string): string {
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error("path escapes allowed directory");
  }
  return resolved;
}

/**
 * Confined to content/leis/ (the actual knowledge base) plus the one
 * explicitly-canonical file outside it (lib/uscis-status-pt.ts) — matching
 * what grep/glob already enforce. The system prompt *asking* the model to
 * stay in content/leis/ isn't access control; this is.
 */
async function toolReadFile(relativePath: string): Promise<string> {
  try {
    const resolved = safeResolve(LEIS_DIR, relativePath);
    const content = await readFile(resolved, "utf-8");
    return content.slice(0, 8000); // cap to keep tool results cheap
  } catch {
    if (path.resolve(REPO_ROOT, relativePath) === USCIS_STATUS_FILE) {
      try {
        const content = await readFile(USCIS_STATUS_FILE, "utf-8");
        return content.slice(0, 8000);
      } catch (err) {
        return `ERROR: could not read ${relativePath}: ${err instanceof Error ? err.message : String(err)}`;
      }
    }
    return `ERROR: could not read ${relativePath}: path is outside content/leis/ (only content/leis/ and lib/uscis-status-pt.ts are readable)`;
  }
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(full)));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

async function toolGrep(pattern: string): Promise<string> {
  try {
    const regex = new RegExp(pattern, "i");
    const targets = [...(await walkFiles(LEIS_DIR)), path.join(REPO_ROOT, "lib", "uscis-status-pt.ts")];
    const matches: string[] = [];

    for (const file of targets) {
      let content: string;
      try {
        content = await readFile(file, "utf-8");
      } catch {
        continue;
      }
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (regex.test(line)) {
          matches.push(`${path.relative(REPO_ROOT, file)}:${i + 1}: ${line.trim()}`);
        }
      });
      if (matches.length > 50) break; // cap
    }

    return matches.length > 0
      ? matches.slice(0, 50).join("\n")
      : "No matches found.";
  } catch (err) {
    return `ERROR: grep failed: ${err instanceof Error ? err.message : String(err)}`;
  }
}

function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`);
}

async function toolGlob(pattern: string): Promise<string> {
  try {
    const files = await walkFiles(LEIS_DIR);
    const regex = globToRegex(pattern);
    const relative = files
      .map((f) => path.relative(LEIS_DIR, f))
      .filter((f) => regex.test(f));
    return relative.length > 0 ? relative.join("\n") : "No files matched.";
  } catch (err) {
    return `ERROR: glob failed: ${err instanceof Error ? err.message : String(err)}`;
  }
}

async function toolWebFetch(url: string): Promise<string> {
  try {
    const parsed = new URL(url);
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return `ERROR: ${parsed.hostname} is not in the official-sources whitelist (content/leis/fontes.md). Refusing to fetch.`;
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return `ERROR: fetch returned ${res.status}`;
    const text = await res.text();
    // Strip tags crudely — this is fact-checking context, not rendering.
    const stripped = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return stripped.slice(0, 6000);
  } catch (err) {
    return `ERROR: web_fetch failed: ${err instanceof Error ? err.message : String(err)}`;
  }
}

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "read_file":
      return toolReadFile(String(input.path));
    case "grep":
      return toolGrep(String(input.pattern));
    case "glob":
      return toolGlob(String(input.pattern));
    case "web_fetch":
      return toolWebFetch(String(input.url));
    default:
      return `ERROR: unknown tool ${name}`;
  }
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
  stop_reason: string;
}

const MAX_TOOL_ITERATIONS = 10;

/**
 * Run the compliance-fact-check agent loop against a draft.
 * Real tool use — not a single-shot prompt — because a compliance check that
 * can't actually read content/leis/ isn't a check.
 */
export async function runComplianceCheck(
  draft: string,
  topic: string,
  apiKey: string
): Promise<ComplianceResult> {
  const messages: AnthropicMessage[] = [
    {
      role: "user",
      content: `Tópico: "${topic}"\n\nRascunho para revisar:\n\n${draft}`,
    },
  ];

  let finalText = "";

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Compliance check API error (${response.status}): ${error}`);
    }

    const data = (await response.json()) as AnthropicResponse;
    messages.push({ role: "assistant", content: data.content });

    const toolUses = data.content.filter((b) => b.type === "tool_use");

    if (toolUses.length === 0 || data.stop_reason !== "tool_use") {
      finalText = data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("\n");
      break;
    }

    const toolResults: AnthropicContentBlock[] = [];
    for (const use of toolUses) {
      const result = await executeTool(use.name!, use.input ?? {});
      toolResults.push({
        type: "tool_result",
        tool_use_id: use.id,
        content: result,
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  if (!finalText) {
    throw new Error("Compliance check did not converge within max tool iterations");
  }

  return parseVerdict(finalText);
}

function parseVerdict(text: string): ComplianceResult {
  const verdictMatch = text.match(/VERDICT:\s*(PASS_WITH_FLAGS|PASS|FAIL)/i);
  const verdict = (verdictMatch?.[1]?.toUpperCase() as ComplianceVerdictLevel) ?? "FAIL";

  const flags: ComplianceFlag[] = [];
  const flagBlockMatch = text.match(/FLAGS:\s*([\s\S]*?)(?=VERIFIED CLAIMS:|$)/i);
  if (flagBlockMatch) {
    const lines = flagBlockMatch[1].split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const m = line.match(/^-\s*\[(UPL|FACT|MISSING|BRAND)\]\s*(.+?)\s*—\s*(.+?)(?:\s*—\s*(.+))?$/);
      if (m) {
        flags.push({
          type: m[1] as ComplianceFlag["type"],
          text: m[2],
          reason: m[3],
          suggestedFix: m[4],
        });
      }
    }
  }

  const verifiedMatch = text.match(/VERIFIED CLAIMS:\s*(.+)/i);
  const verifiedClaims = verifiedMatch?.[1]?.trim() ?? "unknown";

  const unverified: string[] = [];
  const unverifiedBlockMatch = text.match(/UNVERIFIED[^:]*:\s*([\s\S]*)/i);
  if (unverifiedBlockMatch) {
    const lines = unverifiedBlockMatch[1].split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.startsWith("-")) unverified.push(line.replace(/^-\s*/, ""));
    }
  }

  return { verdict, flags, verifiedClaims, unverified, raw: text };
}

/** Format a compliance result as a Slack-friendly mrkdwn block. */
export function formatComplianceForSlack(result: ComplianceResult): string {
  const icon = result.verdict === "PASS" ? "✅" : result.verdict === "PASS_WITH_FLAGS" ? "⚠️" : "🚫";
  const lines = [`${icon} *Compliance: ${result.verdict}*`];

  if (result.flags.length > 0) {
    lines.push("", "*Flags:*");
    for (const flag of result.flags.slice(0, 8)) {
      lines.push(`• [${flag.type}] ${flag.text} — ${flag.reason}`);
    }
  }

  if (result.unverified.length > 0) {
    lines.push("", "*Não verificado:*");
    for (const item of result.unverified.slice(0, 5)) {
      lines.push(`• ${item}`);
    }
  }

  lines.push("", `_Verificadas: ${result.verifiedClaims}_`);

  return lines.join("\n");
}

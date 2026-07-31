"use client";

import { useEffect, useState } from "react";

/**
 * Questionário de enriquecimento do perfil — Parte 1 (básico/carreira, com
 * sinais estruturados de O-1A/EB-1A, investidor e L-1) + Parte 2 (perguntas
 * abertas). Tudo opcional, salva tudo junto num só POST pra /api/profile.
 * Não altera getStrategy() hoje — é coleta para uso futuro na personalização.
 */

interface PerfilData {
  birth_date?:                  string | null;
  birth_country?:               string | null;
  birth_state?:                 string | null;
  birth_city?:                  string | null;
  lives_outside_brazil?:        boolean | null;
  residence_country?:           string | null;
  current_city?:                string | null;
  current_state?:               string | null;
  gender?:                      string | null;
  english_level?:               string | null;
  english_test_taken?:          boolean | null;
  english_test_name?:           string | null;
  english_test_score?:          string | null;
  education_level?:             string | null;
  profession?:                  string | null;
  experience_years?:            string | null;
  achievements?:                string | null;
  o1_criteria?:                 string[] | null;
  investor_capital_available?:  boolean | null;
  investor_capital_range?:      string | null;
  business_owner_experience?:   boolean | null;
  citizenship_country?:         string | null;
  l1_us_br_operations?:         boolean | null;
  l1_in_leadership_role?:       boolean | null;
  l1_leadership_years?:         string | null;
  bio_situation?:               string | null;
  bio_concern?:                 string | null;
  bio_tried?:                   string | null;
}

const ENGLISH_LEVELS = [
  { value: "basico", label: "Básico" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
  { value: "fluente", label: "Fluente ou nativo" },
];

const EDUCATION_LEVELS = [
  { value: "ensino_medio", label: "Ensino médio" },
  { value: "graduacao_andamento", label: "Graduação em andamento" },
  { value: "graduacao_completa", label: "Graduação completa" },
  { value: "pos_graduacao", label: "Pós-graduação" },
  { value: "mestrado", label: "Mestrado" },
  { value: "doutorado", label: "Doutorado" },
];

const EXPERIENCE_RANGES = [
  { value: "0-2", label: "0-2 anos" },
  { value: "3-5", label: "3-5 anos" },
  { value: "6-10", label: "6-10 anos" },
  { value: "10+", label: "10+ anos" },
];

const BRAZIL_STATES = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal",
  "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul",
  "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí",
  "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia",
  "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins",
].map((uf) => ({ value: uf, label: uf }));

// Rótulo do campo "estado/província/região" varia com o país de residência —
// sem lista fechada por país (custoso pra manter certo pra +190 países), só
// o texto do campo muda pra soar natural.
const RESIDENCE_STATE_LABEL: Record<string, string> = {
  Brasil: "Estado",
  "Estados Unidos": "State",
  Portugal: "Distrito",
  Canadá: "Província",
};
function residenceStateLabel(country: string | null | undefined): string {
  return RESIDENCE_STATE_LABEL[country ?? ""] ?? "Estado / Província / Região";
}

const GENDERS = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "nao_binario", label: "Não-binário" },
  { value: "prefiro_nao_dizer", label: "Prefiro não dizer" },
];

// Não existe lista oficial de testes aprovados pelo governo americano (SEVP
// não regula isso — cada escola decide) — estes são os mais amplamente
// aceitos na prática, confirmado em fonte oficial (studyinthestates.dhs.gov).
const ENGLISH_TESTS = [
  { value: "TOEFL", label: "TOEFL" },
  { value: "IELTS", label: "IELTS" },
  { value: "Duolingo English Test", label: "Duolingo" },
  { value: "PTE Academic", label: "PTE Academic" },
  { value: "Outro", label: "Outro" },
];

// Escalas de nota não são normalizadas entre testes — cada um tem seu
// próprio formato, então o placeholder muda conforme o teste escolhido.
const ENGLISH_TEST_SCORE_HINT: Record<string, string> = {
  TOEFL: "0 a 120 (ex: 105)",
  IELTS: "0 a 9.0, em bandas de 0.5 (ex: 7.5)",
  "Duolingo English Test": "10 a 160, de 5 em 5 (ex: 135)",
  "PTE Academic": "10 a 90 (ex: 65)",
  Outro: "Nota ou resultado do teste",
};

// Mesmo range aplicado no servidor (app/api/profile/route.ts) — aqui só pra
// avisar na hora, antes de tentar salvar.
const ENGLISH_TEST_SCORE_RANGE: Record<string, { min: number; max: number }> = {
  TOEFL: { min: 0, max: 120 },
  IELTS: { min: 0, max: 9 },
  "Duolingo English Test": { min: 10, max: 160 },
  "PTE Academic": { min: 10, max: 90 },
};
function scoreOutOfRange(testName: string | null | undefined, score: string | null | undefined): boolean {
  if (!testName || !score) return false;
  const range = ENGLISH_TEST_SCORE_RANGE[testName];
  if (!range) return false;
  const parsed = Number(score.replace(",", "."));
  return !Number.isFinite(parsed) || parsed < range.min || parsed > range.max;
}

const INVESTOR_CAPITAL_RANGES = [
  { value: "menos_50k", label: "Menos de US$50k" },
  { value: "50k_100k", label: "US$50k–100k" },
  { value: "100k_500k", label: "US$100k–500k" },
  { value: "500k_mais", label: "US$500k+" },
];

const L1_LEADERSHIP_YEARS = [
  { value: "menos_1", label: "Menos de 1 ano" },
  { value: "1_3", label: "1 a 3 anos" },
  { value: "3_mais", label: "3+ anos" },
];

// Critérios de habilidade extraordinária — 8 CFR §214.2(o)(3). Marcar não é
// avaliação nem promessa de elegibilidade, só sinaliza o que já se aplica.
const O1_CRITERIA = [
  { value: "premio", label: "Já ganhei um prêmio ou reconhecimento na minha área" },
  { value: "associacao", label: "Sou membro de uma associação que exige feito de destaque pra entrar" },
  { value: "midia", label: "Já saí em matéria de jornal, revista ou mídia especializada" },
  { value: "julgamento", label: "Já julguei ou avaliei o trabalho de outros profissionais" },
  { value: "contribuicao_original", label: "Já contribuí com algo original de peso significativo na minha área" },
  { value: "publicacao", label: "Já publiquei artigo acadêmico ou em veículo de peso" },
  { value: "papel_critico", label: "Já tive papel crítico numa organização de destaque" },
  { value: "salario_alto", label: "Meu salário é alto comparado a outros da minha área" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-ink-faint" style={{ letterSpacing: "0.08em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ButtonGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string | null | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
            value === opt.value
              ? "bg-pine text-cream border-pine"
              : "bg-cream-2 text-ink-soft border-pine-tint hover:border-pine/40"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CheckboxList({
  options,
  values,
  onToggle,
}: {
  options: { value: string; label: string }[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const checked = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            className={`flex items-start gap-3 text-left px-3.5 py-2.5 rounded-xl border transition-colors ${
              checked ? "bg-pine-tint border-pine" : "bg-cream-2 border-pine-tint hover:border-pine/40"
            }`}
          >
            <span
              className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center ${
                checked ? "bg-pine border-pine" : "border-ink-faint"
              }`}
            >
              {checked && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </span>
            <span className="text-sm text-ink leading-snug">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Select({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: { value: string; label: string }[];
  value: string | null | undefined;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-pine-tint bg-cream text-ink text-sm focus:outline-none focus:ring-2 focus:ring-pine focus:border-pine transition";

export default function PerfilQuestionario() {
  const [data, setData] = useState<PerfilData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setData(d.profile ?? {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof PerfilData>(key: K, value: PerfilData[K]) {
    setSaved(false);
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleO1Criteria(v: string) {
    setSaved(false);
    setData((prev) => {
      const atual = prev.o1_criteria ?? [];
      const proximo = atual.includes(v) ? atual.filter((c) => c !== v) : [...atual, v];
      return { ...prev, o1_criteria: proximo };
    });
  }

  async function salvar() {
    if (scoreOutOfRange(data.english_test_name, data.english_test_score)) {
      setError("Corrige a nota do teste de inglês antes de salvar.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch {
      setError("Não conseguimos salvar agora. Tente de novo.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-ink-faint text-sm py-6">
        <span className="w-4 h-4 rounded-full border-2 border-pine-tint border-t-pine animate-spin inline-block" />
        Carregando seu perfil...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-ink-soft text-sm leading-relaxed">
          Quanto mais a gente souber sobre você, melhor conseguimos te ajudar.
          Nada aqui é obrigatório — preenche o que fizer sentido, no seu tempo.
        </p>
      </div>

      {/* ── Meu Perfil immigrei — exportável, grátis, sempre disponível ── */}
      <div className="bg-pine rounded-2xl px-5 py-5">
        <p className="text-xs font-bold uppercase tracking-widest text-pine-tint mb-1" style={{ letterSpacing: "0.1em" }}>
          Meu Perfil immigrei
        </p>
        <p className="text-sm font-semibold text-cream mb-1">
          Uma carta de apresentação com o que você já contou aqui
        </p>
        <p className="text-xs text-pine-tint mb-4 leading-relaxed">
          Pronta pra levar pra um advogado, uma empresa ou guardar pra você. Atualiza sozinha
          conforme você preenche mais — quanto mais completo o perfil, mais completo o documento.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/api/perfil/export?locale=pt"
            className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-ink hover:bg-amber-deep transition-colors"
          >
            Baixar em Português →
          </a>
          <a
            href="/api/perfil/export?locale=en"
            className="inline-flex items-center gap-2 rounded-full border border-cream/40 px-5 py-2.5 text-sm font-bold text-cream hover:bg-pine-deep transition-colors"
          >
            Download in English →
          </a>
        </div>
      </div>

      {/* ── Parte 1 — Básico ────────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
          O básico
        </h2>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Data de nascimento">
            <input
              type="date"
              value={data.birth_date ?? ""}
              onChange={(e) => set("birth_date", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Gênero">
            <ButtonGroup options={GENDERS} value={data.gender} onChange={(v) => set("gender", v)} />
          </Field>

          <Field label="País de nascimento">
            <input
              type="text"
              maxLength={120}
              value={data.birth_country ?? ""}
              onChange={(e) => set("birth_country", e.target.value)}
              placeholder="Ex: Brasil"
              className={inputClass}
            />
          </Field>

          {data.birth_country === "Brasil" && (
            <Field label="Estado de nascimento">
              <Select
                options={BRAZIL_STATES}
                value={data.birth_state}
                onChange={(v) => set("birth_state", v)}
                placeholder="Selecione o estado"
              />
            </Field>
          )}

          <Field label="Cidade de nascimento">
            <input
              type="text"
              maxLength={120}
              value={data.birth_city ?? ""}
              onChange={(e) => set("birth_city", e.target.value)}
              placeholder="Ex: Belo Horizonte"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Você mora fora do Brasil hoje?">
          <ButtonGroup
            options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]}
            value={data.lives_outside_brazil === true ? "sim" : data.lives_outside_brazil === false ? "nao" : null}
            onChange={(v) => set("lives_outside_brazil", v === "sim")}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          {data.lives_outside_brazil && (
            <Field label="País onde mora hoje">
              <input
                type="text"
                maxLength={120}
                value={data.residence_country ?? ""}
                onChange={(e) => set("residence_country", e.target.value)}
                placeholder="Ex: Estados Unidos"
                className={inputClass}
              />
            </Field>
          )}

          <Field label="Cidade onde mora hoje">
            <input
              type="text"
              maxLength={120}
              value={data.current_city ?? ""}
              onChange={(e) => set("current_city", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={data.lives_outside_brazil ? residenceStateLabel(data.residence_country) : "Estado onde mora hoje"}>
            <input
              type="text"
              maxLength={120}
              value={data.current_state ?? ""}
              onChange={(e) => set("current_state", e.target.value)}
              placeholder="Ex: São Paulo ou California"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Nível de inglês">
          <ButtonGroup options={ENGLISH_LEVELS} value={data.english_level} onChange={(v) => set("english_level", v)} />
        </Field>

        <Field label="Já fez algum teste de inglês?">
          <ButtonGroup
            options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]}
            value={data.english_test_taken === true ? "sim" : data.english_test_taken === false ? "nao" : null}
            onChange={(v) => set("english_test_taken", v === "sim")}
          />
        </Field>

        {data.english_test_taken && (
          <div className="flex flex-col gap-5 -mt-2">
            <Field label="Qual teste">
              <ButtonGroup
                options={ENGLISH_TESTS}
                value={data.english_test_name}
                onChange={(v) => set("english_test_name", v)}
              />
            </Field>
            <Field label="Nota / pontuação">
              <input
                type="text"
                maxLength={120}
                value={data.english_test_score ?? ""}
                onChange={(e) => set("english_test_score", e.target.value)}
                placeholder={ENGLISH_TEST_SCORE_HINT[data.english_test_name ?? "Outro"] ?? ENGLISH_TEST_SCORE_HINT.Outro}
                className={`${inputClass} sm:max-w-xs`}
              />
              {scoreOutOfRange(data.english_test_name, data.english_test_score) && (
                <p className="text-xs font-semibold" style={{ color: "var(--clay)" }}>
                  Essa nota está fora do range possível pro {data.english_test_name} ({ENGLISH_TEST_SCORE_HINT[data.english_test_name ?? "Outro"]}).
                </p>
              )}
            </Field>
          </div>
        )}

        <Field label="Escolaridade">
          <ButtonGroup options={EDUCATION_LEVELS} value={data.education_level} onChange={(v) => set("education_level", v)} />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Profissão / área de atuação">
            <input
              type="text"
              maxLength={120}
              value={data.profession ?? ""}
              onChange={(e) => set("profession", e.target.value)}
              placeholder="Ex: Engenheira de software"
              className={inputClass}
            />
          </Field>

          <Field label="Anos de experiência na área">
            <ButtonGroup options={EXPERIENCE_RANGES} value={data.experience_years} onChange={(v) => set("experience_years", v)} />
          </Field>
        </div>
      </section>

      {/* ── Sinais estruturados ─────────────────────────────────────── */}
      <section className="flex flex-col gap-6 border-t border-pine-tint pt-6">
        <div>
          <h2 className="text-lg font-bold text-ink mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Reconhecimento e trajetória
          </h2>
          <p className="text-ink-faint text-sm">
            Marca o que já se aplica a você — cada item aqui é um critério real usado em pedidos de habilidade extraordinária.
          </p>
        </div>

        <CheckboxList options={O1_CRITERIA} values={data.o1_criteria ?? []} onToggle={toggleO1Criteria} />

        <Field label="Quer contar mais sobre algum desses pontos? (opcional)">
          <textarea
            maxLength={280}
            rows={3}
            value={data.achievements ?? ""}
            onChange={(e) => set("achievements", e.target.value)}
            placeholder="Detalha o que marcou acima — nome do prêmio, veículo da matéria, revista da publicação..."
            className={`${inputClass} resize-none`}
          />
        </Field>

        <div className="flex flex-col gap-4 bg-cream-2 rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint" style={{ letterSpacing: "0.08em" }}>
            Investimento e negócio próprio
          </p>
          <Field label="Qual sua cidadania? (importa pra visto de investidor — alguns exigem país de tratado com os EUA)">
            <input
              type="text"
              maxLength={120}
              value={data.citizenship_country ?? ""}
              onChange={(e) => set("citizenship_country", e.target.value)}
              placeholder="Ex: Brasileira"
              className={`${inputClass} sm:max-w-xs`}
            />
          </Field>
          <Field label="Você tem capital disponível pra investir num negócio nos EUA?">
            <ButtonGroup
              options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]}
              value={data.investor_capital_available === true ? "sim" : data.investor_capital_available === false ? "nao" : null}
              onChange={(v) => set("investor_capital_available", v === "sim")}
            />
          </Field>
          {data.investor_capital_available && (
            <Field label="Faixa de valor">
              <ButtonGroup
                options={INVESTOR_CAPITAL_RANGES}
                value={data.investor_capital_range}
                onChange={(v) => set("investor_capital_range", v)}
              />
            </Field>
          )}
          <Field label="Você já é dono ou sócio de uma empresa?">
            <ButtonGroup
              options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]}
              value={data.business_owner_experience === true ? "sim" : data.business_owner_experience === false ? "nao" : null}
              onChange={(v) => set("business_owner_experience", v === "sim")}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-4 bg-cream-2 rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint" style={{ letterSpacing: "0.08em" }}>
            Transferência dentro da empresa
          </p>
          <Field label="Sua empresa atual tem operação nos EUA e no Brasil (mesma empresa, filial ou grupo)?">
            <ButtonGroup
              options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]}
              value={data.l1_us_br_operations === true ? "sim" : data.l1_us_br_operations === false ? "nao" : null}
              onChange={(v) => set("l1_us_br_operations", v === "sim")}
            />
          </Field>
          {data.l1_us_br_operations && (
            <Field label="Você já atua em função de gerência, liderança ou conhecimento especializado?">
              <ButtonGroup
                options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]}
                value={data.l1_in_leadership_role === true ? "sim" : data.l1_in_leadership_role === false ? "nao" : null}
                onChange={(v) => set("l1_in_leadership_role", v === "sim")}
              />
            </Field>
          )}
          {data.l1_us_br_operations && data.l1_in_leadership_role && (
            <Field label="Há quanto tempo?">
              <ButtonGroup
                options={L1_LEADERSHIP_YEARS}
                value={data.l1_leadership_years}
                onChange={(v) => set("l1_leadership_years", v)}
              />
            </Field>
          )}
        </div>
      </section>

      {/* ── Parte 2 — Conte mais ────────────────────────────────────── */}
      <section className="flex flex-col gap-5 border-t border-pine-tint pt-6">
        <h2 className="text-lg font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Conte mais
        </h2>
        <p className="text-ink-faint text-sm -mt-3">
          Sem formalidade — responde como se estivesse contando pra um amigo.
        </p>

        <Field label="Em uma frase, como é a sua situação hoje?">
          <textarea
            maxLength={280}
            rows={2}
            value={data.bio_situation ?? ""}
            onChange={(e) => set("bio_situation", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <Field label="O que mais pesa ou te preocupa nessa jornada?">
          <textarea
            maxLength={280}
            rows={2}
            value={data.bio_concern ?? ""}
            onChange={(e) => set("bio_concern", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <Field label="O que você já tentou ou pesquisou até agora?">
          <textarea
            maxLength={280}
            rows={2}
            value={data.bio_tried ?? ""}
            onChange={(e) => set("bio_tried", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </Field>
      </section>

      <div className="flex items-center gap-3 sticky bottom-4">
        <button
          onClick={salvar}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-pine text-cream font-semibold text-sm hover:bg-pine-deep transition-colors disabled:opacity-50 shadow-lg"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
        {saved && <span className="text-sm font-semibold text-sage">Salvo ✓</span>}
        {error && <span className="text-sm font-semibold text-clay">{error}</span>}
      </div>
    </div>
  );
}

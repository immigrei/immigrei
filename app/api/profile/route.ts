import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const FamilyTiesSchema = z.enum(["spouse_citizen", "parent_child_citizen", "family_gc", "none"]);
const EnglishLevelSchema = z.enum(["basico", "intermediario", "avancado", "fluente"]);
const EducationLevelSchema = z.enum([
  "ensino_medio", "graduacao_andamento", "graduacao_completa", "pos_graduacao", "mestrado", "doutorado",
]);
const ExperienceYearsSchema = z.enum(["0-2", "3-5", "6-10", "10+"]);
const EnglishTestNameSchema = z.enum(["TOEFL", "IELTS", "Duolingo English Test", "PTE Academic", "Outro"]);
const InvestorCapitalRangeSchema = z.enum(["menos_50k", "50k_100k", "100k_500k", "500k_mais"]);
const L1LeadershipYearsSchema = z.enum(["menos_1", "1_3", "3_mais"]);
// Cada teste de inglês tem escala própria — nota fora do range real do teste
// não é um erro de digitação sutil, é impossível (ex: PTE Academic vai até 90).
const ENGLISH_TEST_SCORE_RANGE: Record<string, { min: number; max: number }> = {
  TOEFL: { min: 0, max: 120 },
  IELTS: { min: 0, max: 9 },
  "Duolingo English Test": { min: 10, max: 160 },
  "PTE Academic": { min: 10, max: 90 },
};
// Critérios de habilidade extraordinária, 8 CFR §214.2(o)(3) — chaves fixas,
// o texto de cada uma vive só no componente (copy pode mudar sem migração).
const O1CriteriaSchema = z.enum([
  "premio", "associacao", "midia", "julgamento", "contribuicao_original", "publicacao", "papel_critico", "salario_alto",
]);
// Campos abertos do perfil — limite generoso o bastante pra ter conteúdo de
// verdade, curto o bastante pra continuar sendo objetivo (não é campo livre
// sem fim, é "me conte em poucas frases").
const OpenTextSchema = z.string().trim().max(280);
const ShortTextSchema = z.string().trim().max(120);
const ChosenSchoolSchema = z.object({
  school_name: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  campus_code: z.string().min(1),
}).passthrough();

// Partial upsert: the onboarding flow saves in stages (questionnaire →
// visa selection), so any subset of fields may arrive. visa_type marks
// the journey as chosen and completes onboarding.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const body = await req.json().catch(() => ({}));
  const {
    visa_type, arrival_date, main_goal, location, nationality, chosen_school, i94_expiry_date, family_ties, f1_program_start_date,
    // Perfil — Parte 1 (básico/carreira)
    birth_date, birth_city, birth_country, birth_state, current_city, current_state, gender,
    english_level, english_test_taken, english_test_name, english_test_score,
    education_level, profession, experience_years, achievements,
    // Perfil — sinais estruturados (O-1A/EB-1A, investidor, L-1)
    o1_criteria, investor_capital_available, investor_capital_range, business_owner_experience,
    citizenship_country, has_other_citizenship, other_citizenship_country,
    l1_us_br_operations, l1_in_leadership_role, l1_leadership_years,
    // Perfil — residência (mora fora do Brasil?)
    lives_outside_brazil, residence_country,
    // Perfil — Parte 2 (perguntas abertas)
    bio_situation, bio_concern, bio_tried,
  } = body;

  const perfilFields = [
    birth_date, birth_city, birth_country, birth_state, current_city, current_state, gender,
    english_level, english_test_taken, english_test_name, english_test_score,
    education_level, profession, experience_years, achievements,
    o1_criteria, investor_capital_available, investor_capital_range, business_owner_experience,
    citizenship_country, has_other_citizenship, other_citizenship_country,
    l1_us_br_operations, l1_in_leadership_role, l1_leadership_years,
    lives_outside_brazil, residence_country,
    bio_situation, bio_concern, bio_tried,
  ];

  if (
    !visa_type && !arrival_date && !main_goal && !location && !nationality &&
    chosen_school === undefined && i94_expiry_date === undefined && family_ties === undefined &&
    f1_program_start_date === undefined && perfilFields.every((f) => f === undefined)
  ) {
    return NextResponse.json({ error: "No fields to save" }, { status: 400 });
  }

  if (i94_expiry_date !== undefined && i94_expiry_date !== null && !DateStringSchema.safeParse(i94_expiry_date).success) {
    return NextResponse.json({ error: "Invalid i94_expiry_date" }, { status: 400 });
  }

  if (f1_program_start_date !== undefined && f1_program_start_date !== null && !DateStringSchema.safeParse(f1_program_start_date).success) {
    return NextResponse.json({ error: "Invalid f1_program_start_date" }, { status: 400 });
  }

  if (family_ties !== undefined && family_ties !== null && !FamilyTiesSchema.safeParse(family_ties).success) {
    return NextResponse.json({ error: "Invalid family_ties" }, { status: 400 });
  }

  // chosen_school: campus snapshot from /escolas, or null to clear it.
  if (chosen_school !== undefined && chosen_school !== null && !ChosenSchoolSchema.safeParse(chosen_school).success) {
    return NextResponse.json({ error: "Invalid chosen_school" }, { status: 400 });
  }

  // Perfil — todos os campos são opcionais (null limpa o campo), mas quando
  // preenchidos precisam bater com o formato esperado.
  if (birth_date !== undefined && birth_date !== null && !DateStringSchema.safeParse(birth_date).success) {
    return NextResponse.json({ error: "Invalid birth_date" }, { status: 400 });
  }
  for (const [key, value] of Object.entries({
    birth_city, birth_country, birth_state, current_city, current_state, profession,
    residence_country, citizenship_country, other_citizenship_country,
  })) {
    if (value !== undefined && value !== null && !ShortTextSchema.safeParse(value).success) {
      return NextResponse.json({ error: `Invalid ${key}` }, { status: 400 });
    }
  }
  if (gender !== undefined && gender !== null && !ShortTextSchema.safeParse(gender).success) {
    return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
  }
  if (english_level !== undefined && english_level !== null && !EnglishLevelSchema.safeParse(english_level).success) {
    return NextResponse.json({ error: "Invalid english_level" }, { status: 400 });
  }
  if (english_test_taken !== undefined && english_test_taken !== null && typeof english_test_taken !== "boolean") {
    return NextResponse.json({ error: "Invalid english_test_taken" }, { status: 400 });
  }
  if (english_test_name !== undefined && english_test_name !== null && !EnglishTestNameSchema.safeParse(english_test_name).success) {
    return NextResponse.json({ error: "Invalid english_test_name" }, { status: 400 });
  }
  if (english_test_score !== undefined && english_test_score !== null && !ShortTextSchema.safeParse(english_test_score).success) {
    return NextResponse.json({ error: "Invalid english_test_score" }, { status: 400 });
  }
  if (english_test_score !== undefined && english_test_score !== null) {
    const testName = english_test_name ?? undefined;
    const range = testName ? ENGLISH_TEST_SCORE_RANGE[testName] : undefined;
    if (range) {
      const parsed = Number(String(english_test_score).replace(",", "."));
      if (!Number.isFinite(parsed) || parsed < range.min || parsed > range.max) {
        return NextResponse.json({ error: `Invalid english_test_score for ${testName} (expected ${range.min}-${range.max})` }, { status: 400 });
      }
    }
  }
  if (education_level !== undefined && education_level !== null && !EducationLevelSchema.safeParse(education_level).success) {
    return NextResponse.json({ error: "Invalid education_level" }, { status: 400 });
  }
  if (experience_years !== undefined && experience_years !== null && !ExperienceYearsSchema.safeParse(experience_years).success) {
    return NextResponse.json({ error: "Invalid experience_years" }, { status: 400 });
  }
  for (const [key, value] of Object.entries({ achievements, bio_situation, bio_concern, bio_tried })) {
    if (value !== undefined && value !== null && !OpenTextSchema.safeParse(value).success) {
      return NextResponse.json({ error: `Invalid ${key}` }, { status: 400 });
    }
  }

  // Sinais estruturados — cada um opcional, mas quando presentes precisam
  // bater com a lista fechada (não é texto livre, é gatilho de caminho).
  if (o1_criteria !== undefined && o1_criteria !== null) {
    if (!Array.isArray(o1_criteria) || !o1_criteria.every((c: unknown) => O1CriteriaSchema.safeParse(c).success)) {
      return NextResponse.json({ error: "Invalid o1_criteria" }, { status: 400 });
    }
  }
  for (const [key, value] of Object.entries({
    investor_capital_available, business_owner_experience, l1_us_br_operations,
    l1_in_leadership_role, lives_outside_brazil, has_other_citizenship,
  })) {
    if (value !== undefined && value !== null && typeof value !== "boolean") {
      return NextResponse.json({ error: `Invalid ${key}` }, { status: 400 });
    }
  }
  if (investor_capital_range !== undefined && investor_capital_range !== null && !InvestorCapitalRangeSchema.safeParse(investor_capital_range).success) {
    return NextResponse.json({ error: "Invalid investor_capital_range" }, { status: 400 });
  }
  if (l1_leadership_years !== undefined && l1_leadership_years !== null && !L1LeadershipYearsSchema.safeParse(l1_leadership_years).success) {
    return NextResponse.json({ error: "Invalid l1_leadership_years" }, { status: 400 });
  }

  const row: Record<string, unknown> = {
    clerk_user_id: userId,
    full_name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
    email: user?.emailAddresses[0]?.emailAddress ?? null,
    updated_at: new Date().toISOString(),
  };
  if (visa_type) {
    row.visa_type = visa_type;
    row.onboarding_completed = true;
  }
  if (arrival_date) row.arrival_date = arrival_date;
  if (main_goal) row.main_goal = main_goal;
  if (location) row.location = location;
  if (nationality) row.nationality = nationality;
  if (i94_expiry_date !== undefined) row.i94_expiry_date = i94_expiry_date;
  if (family_ties !== undefined) row.family_ties = family_ties;
  if (f1_program_start_date !== undefined) row.f1_program_start_date = f1_program_start_date;
  // Perfil — cada campo é independente, salva só o que veio no corpo.
  if (birth_date !== undefined) row.birth_date = birth_date;
  if (birth_city !== undefined) row.birth_city = birth_city;
  if (birth_country !== undefined) row.birth_country = birth_country;
  if (birth_state !== undefined) row.birth_state = birth_state;
  if (current_city !== undefined) row.current_city = current_city;
  if (current_state !== undefined) row.current_state = current_state;
  if (gender !== undefined) row.gender = gender;
  if (english_level !== undefined) row.english_level = english_level;
  if (english_test_taken !== undefined) row.english_test_taken = english_test_taken;
  if (english_test_name !== undefined) row.english_test_name = english_test_name;
  if (english_test_score !== undefined) row.english_test_score = english_test_score;
  if (education_level !== undefined) row.education_level = education_level;
  if (profession !== undefined) row.profession = profession;
  if (experience_years !== undefined) row.experience_years = experience_years;
  if (achievements !== undefined) row.achievements = achievements;
  if (bio_situation !== undefined) row.bio_situation = bio_situation;
  if (bio_concern !== undefined) row.bio_concern = bio_concern;
  if (bio_tried !== undefined) row.bio_tried = bio_tried;
  if (o1_criteria !== undefined) row.o1_criteria = o1_criteria;
  if (investor_capital_available !== undefined) row.investor_capital_available = investor_capital_available;
  if (investor_capital_range !== undefined) row.investor_capital_range = investor_capital_range;
  if (business_owner_experience !== undefined) row.business_owner_experience = business_owner_experience;
  if (citizenship_country !== undefined) row.citizenship_country = citizenship_country;
  if (has_other_citizenship !== undefined) row.has_other_citizenship = has_other_citizenship;
  if (other_citizenship_country !== undefined) row.other_citizenship_country = other_citizenship_country;
  if (l1_us_br_operations !== undefined) row.l1_us_br_operations = l1_us_br_operations;
  if (l1_in_leadership_role !== undefined) row.l1_in_leadership_role = l1_in_leadership_role;
  if (l1_leadership_years !== undefined) row.l1_leadership_years = l1_leadership_years;
  if (lives_outside_brazil !== undefined) row.lives_outside_brazil = lives_outside_brazil;
  if (residence_country !== undefined) row.residence_country = residence_country;
  if (chosen_school !== undefined) {
    row.chosen_school = chosen_school === null ? null : {
      school_name: String(chosen_school.school_name),
      campus_name: String(chosen_school.campus_name ?? chosen_school.school_name),
      city:        String(chosen_school.city),
      state:       String(chosen_school.state),
      campus_code: String(chosen_school.campus_code),
      accepts_f:   Boolean(chosen_school.accepts_f),
      accepts_m:   Boolean(chosen_school.accepts_m),
      chosen_at:   new Date().toISOString(),
    };
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .upsert(row, { onConflict: "clerk_user_id" });

  if (error) {
    console.error("Supabase upsert error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Reset onboarding: clears only the journey fields so the user can redo the
// questionnaire. Never deletes the row — user_documents, user_checklist_items
// and community tables cascade on profile deletion, and the vault must survive.
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      visa_type: null,
      arrival_date: null,
      main_goal: null,
      location: null,
      nationality: null,
      chosen_school: null,
      i94_expiry_date: null,
      family_ties: null,
      f1_program_start_date: null,
      onboarding_completed: false,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", userId);

  if (error) {
    console.error("Supabase reset error:", error);
    return NextResponse.json({ error: "Failed to reset onboarding" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (error) return NextResponse.json({ profile: null });
  return NextResponse.json({ profile: data });
}

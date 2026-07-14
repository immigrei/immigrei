-- Family ties to a US citizen / green card holder, captured by the
-- onboarding question q_family_ties. Until now this answer only drove
-- client-side routing during the questionnaire and was discarded — it
-- never reached the profile, so /painel could never surface the
-- marriage/family-based Green Card path for users who already answered it.
alter table profiles
  add column if not exists family_ties text
    check (family_ties in ('spouse_citizen', 'parent_child_citizen', 'family_gc', 'none'));

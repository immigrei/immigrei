-- Fixes from the pre-merge code review (2026-07-07):
--
-- 1. One case per user (MVP invariant, RFC-001) was enforced only in app
--    code; unique(user_id, sevis_id) treats NULL sevis_id as distinct, so
--    two concurrent first saves created duplicate rows. Enforce in the DB.
--    (v2 multi-case will need to drop this index deliberately.)

-- Keep the earliest case per user before adding the constraint.
delete from cos_b2_f1_cases c
using cos_b2_f1_cases d
where c.user_id = d.user_id
  and (c.created_at, c.id) > (d.created_at, d.id);

create unique index if not exists cos_b2_f1_cases_user_id_uidx
  on cos_b2_f1_cases (user_id);

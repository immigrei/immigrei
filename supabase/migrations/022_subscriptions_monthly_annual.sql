-- Single subscription tier replacing base/core: billed monthly or annually,
-- same features either way. See lib/stripe.ts PLANS.
alter table subscriptions drop constraint subscriptions_plan_check;
alter table subscriptions add constraint subscriptions_plan_check
  check (plan in ('monthly', 'annual'));

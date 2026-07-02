-- Stripe subscriptions per user. Written only by the Stripe webhook
-- (service role); the app reads plan via lib/plan.ts.
create table if not exists subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 text not null unique references profiles(clerk_user_id) on delete cascade,
  stripe_customer_id      text not null,
  stripe_subscription_id  text,
  plan                    text not null check (plan in ('base', 'core')),
  status                  text not null,
  current_period_end      timestamptz,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

alter table subscriptions enable row level security;

drop policy if exists "Users can read own subscription" on subscriptions;
create policy "Users can read own subscription"
  on subscriptions for select
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

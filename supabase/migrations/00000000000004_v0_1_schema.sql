-- v0.1: 수집함(캡처/정리), 파티/개인 다중 장부, 반복 거래, 파티 지출 상한 목표
-- (docs/DESIGN.md §5.2)

alter table public.ledgers
  add column kind text not null default 'main' check (kind in ('main', 'party', 'personal'));

alter table public.goals
  add column kind text not null default 'saving' check (kind in ('saving', 'spending_cap'));

alter table public.transactions
  add column status text not null default 'sorted' check (status in ('unsorted', 'sorted')),
  add column photo_url text,
  add column video_url text,
  add column raw_comment text;

create index idx_transactions_status on public.transactions (status);

create table public.recurring_rules (
  id uuid primary key,
  ledger_id uuid not null references public.ledgers (id),
  user_id uuid references auth.users (id),
  type text not null check (type in ('income', 'expense')),
  amount bigint not null,
  category_id uuid,
  account_id uuid,
  memo text,
  frequency text not null check (frequency in ('monthly', 'weekly')),
  day_of_month integer,
  weekday integer,
  start_on date not null,
  end_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_recurring_rules_pull on public.recurring_rules (ledger_id, updated_at);

alter table public.recurring_rules enable row level security;

create policy recurring_rules_all on public.recurring_rules
  for all using (public.is_ledger_member(ledger_id))
  with check (public.is_ledger_member(ledger_id));

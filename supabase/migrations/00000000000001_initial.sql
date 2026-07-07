-- 제로가계부 초기 스키마
-- 로컬 SQLite와 같은 구조를 Postgres로 미러링. 동기화는 updated_at 커서 기반 pull,
-- 클라이언트 생성 uuid를 그대로 upsert하는 push 방식.

-- 장부: 데이터 소유의 기본 단위 (혼자 = 멤버 1명, 부부 = 멤버 2명)
create table public.ledgers (
  id uuid primary key,
  user_id uuid references auth.users (id),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.ledger_members (
  id uuid primary key,
  ledger_id uuid not null references public.ledgers (id),
  user_id uuid not null references auth.users (id),
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (ledger_id, user_id)
);

create table public.accounts (
  id uuid primary key,
  ledger_id uuid not null references public.ledgers (id),
  user_id uuid references auth.users (id),
  name text not null,
  type text not null check (type in ('cash', 'card', 'bank')),
  color text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.categories (
  id uuid primary key,
  ledger_id uuid not null references public.ledgers (id),
  user_id uuid references auth.users (id),
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null,
  color text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.transactions (
  id uuid primary key,
  ledger_id uuid not null references public.ledgers (id),
  user_id uuid references auth.users (id),
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount bigint not null,
  category_id uuid,
  account_id uuid,
  to_account_id uuid,
  memo text,
  occurred_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.goals (
  id uuid primary key,
  ledger_id uuid not null references public.ledgers (id),
  user_id uuid references auth.users (id),
  month text not null, -- YYYY-MM
  saving_target bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.budgets (
  id uuid primary key,
  ledger_id uuid not null references public.ledgers (id),
  user_id uuid references auth.users (id),
  month text not null, -- YYYY-MM
  category_id uuid not null,
  amount bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- pull 커서(ledger_id + updated_at) 인덱스
create index idx_accounts_pull on public.accounts (ledger_id, updated_at);
create index idx_categories_pull on public.categories (ledger_id, updated_at);
create index idx_transactions_pull on public.transactions (ledger_id, updated_at);
create index idx_goals_pull on public.goals (ledger_id, updated_at);
create index idx_budgets_pull on public.budgets (ledger_id, updated_at);
create index idx_ledger_members_user on public.ledger_members (user_id);

-- 멤버십 확인 (RLS에서 사용, ledger_members 자신을 조회하므로 security definer)
create or replace function public.is_ledger_member(p_ledger_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ledger_members m
    where m.ledger_id = p_ledger_id
      and m.user_id = auth.uid()
      and m.deleted_at is null
  );
$$;

-- RLS: 모든 테이블은 장부 멤버만 접근
alter table public.ledgers enable row level security;
alter table public.ledger_members enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.budgets enable row level security;

-- ledgers: 멤버는 조회/수정, 본인 소유로 생성
create policy ledgers_select on public.ledgers
  for select using (public.is_ledger_member(id));
create policy ledgers_insert on public.ledgers
  for insert with check (user_id = auth.uid());
create policy ledgers_update on public.ledgers
  for update using (public.is_ledger_member(id));

-- ledger_members: 자기 멤버십 조회 + 같은 장부 멤버 조회, 본인 행만 생성
create policy ledger_members_select on public.ledger_members
  for select using (user_id = auth.uid() or public.is_ledger_member(ledger_id));
create policy ledger_members_insert on public.ledger_members
  for insert with check (user_id = auth.uid());
create policy ledger_members_update on public.ledger_members
  for update using (user_id = auth.uid());

-- 데이터 테이블 공통: 장부 멤버만 (부부는 서로의 기록을 읽고 쓸 수 있다)
create policy accounts_all on public.accounts
  for all using (public.is_ledger_member(ledger_id))
  with check (public.is_ledger_member(ledger_id));
create policy categories_all on public.categories
  for all using (public.is_ledger_member(ledger_id))
  with check (public.is_ledger_member(ledger_id));
create policy transactions_all on public.transactions
  for all using (public.is_ledger_member(ledger_id))
  with check (public.is_ledger_member(ledger_id));
create policy goals_all on public.goals
  for all using (public.is_ledger_member(ledger_id))
  with check (public.is_ledger_member(ledger_id));
create policy budgets_all on public.budgets
  for all using (public.is_ledger_member(ledger_id))
  with check (public.is_ledger_member(ledger_id));

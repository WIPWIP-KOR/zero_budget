-- 동기부여 공유 피드: 절약/멋진 소비/목표 달성 자랑 포스트

create table public.posts (
  id uuid primary key,
  user_id uuid not null references auth.users (id),
  author_name text not null default '익명',
  type text not null check (type in ('saving_win', 'nice_spend', 'goal_done')),
  message text not null,
  amount bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_posts_created on public.posts (created_at desc);

alter table public.posts enable row level security;

-- 로그인한 모든 사용자가 피드를 읽는다 (공개 피드)
create policy posts_select on public.posts
  for select using (auth.uid() is not null and deleted_at is null);
create policy posts_insert on public.posts
  for insert with check (user_id = auth.uid());
create policy posts_update on public.posts
  for update using (user_id = auth.uid());

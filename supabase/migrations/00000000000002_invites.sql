-- 부부(배우자) 초대: 코드 발급 → 코드 입력으로 장부 합류

create table public.ledger_invites (
  id uuid primary key default gen_random_uuid(),
  ledger_id uuid not null references public.ledgers (id),
  code text not null unique,
  created_by uuid not null references auth.users (id),
  expires_at timestamptz not null default now() + interval '24 hours',
  used_by uuid references auth.users (id),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.ledger_invites enable row level security;

create policy invites_select on public.ledger_invites
  for select using (public.is_ledger_member(ledger_id));
create policy invites_insert on public.ledger_invites
  for insert with check (public.is_ledger_member(ledger_id) and created_by = auth.uid());

-- 코드로 합류: 초대 검증 후 멤버십 추가 (RLS 우회가 필요해 security definer)
create or replace function public.join_ledger_with_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다';
  end if;

  select * into v_invite
  from public.ledger_invites
  where code = upper(trim(p_code))
    and used_at is null
    and expires_at > now();

  if not found then
    raise exception '유효하지 않거나 만료된 초대 코드입니다';
  end if;

  -- 이미 멤버면 그대로 성공 처리
  if not exists (
    select 1 from public.ledger_members
    where ledger_id = v_invite.ledger_id
      and user_id = auth.uid()
      and deleted_at is null
  ) then
    insert into public.ledger_members (id, ledger_id, user_id, role)
    values (gen_random_uuid(), v_invite.ledger_id, auth.uid(), 'member');
  end if;

  update public.ledger_invites
  set used_by = auth.uid(), used_at = now()
  where id = v_invite.id;

  return v_invite.ledger_id;
end;
$$;

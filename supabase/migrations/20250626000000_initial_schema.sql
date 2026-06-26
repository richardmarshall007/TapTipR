-- TapTipR initial schema

create extension if not exists "pgcrypto";

-- Workplaces (participating businesses)
create table public.workplaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  business_code text not null unique,
  logo_emoji text not null default '☕',
  created_at timestamptz not null default now()
);

-- Profiles (employee/customer wallets)
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  role text not null check (role in ('employee', 'customer')),
  employee_code text unique,
  workplace_id uuid references public.workplaces (id) on delete set null,
  wallet_balance_cents bigint not null default 0 check (wallet_balance_cents >= 0),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  constraint employee_code_required_for_employees
    check (role <> 'employee' or employee_code is not null)
);

create index profiles_employee_code_idx on public.profiles (employee_code);
create index profiles_workplace_id_idx on public.profiles (workplace_id);

-- Tips sent between profiles
create table public.tips (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid references public.profiles (id) on delete set null,
  from_name text not null,
  to_profile_id uuid not null references public.profiles (id) on delete cascade,
  workplace_id uuid references public.workplaces (id) on delete set null,
  amount_cents bigint not null check (amount_cents > 0),
  nps_score smallint check (nps_score between 0 and 10),
  created_at timestamptz not null default now()
);

create index tips_to_profile_id_idx on public.tips (to_profile_id);
create index tips_from_profile_id_idx on public.tips (from_profile_id);

-- Wallet ledger
create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('top_up', 'tip_sent', 'tip_received', 'withdraw')),
  amount_cents bigint not null,
  label text not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create index wallet_transactions_profile_id_idx on public.wallet_transactions (profile_id);

-- Atomic tip: debit sender, credit receiver, insert tip + ledger rows
create or replace function public.send_tip(
  p_from_profile_id uuid,
  p_from_name text,
  p_to_profile_id uuid,
  p_amount_cents bigint,
  p_nps_score smallint default null,
  p_workplace_id uuid default null
)
returns public.tips
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender_balance bigint;
  v_tip public.tips;
begin
  if p_amount_cents <= 0 then
    raise exception 'Tip amount must be positive';
  end if;

  if p_from_profile_id is not null then
    select wallet_balance_cents into v_sender_balance
    from public.profiles
    where id = p_from_profile_id
    for update;

    if not found then
      raise exception 'Sender profile not found';
    end if;

    if v_sender_balance < p_amount_cents then
      raise exception 'Insufficient wallet balance';
    end if;

    update public.profiles
    set wallet_balance_cents = wallet_balance_cents - p_amount_cents
    where id = p_from_profile_id;

    insert into public.wallet_transactions (profile_id, type, amount_cents, label)
    values (
      p_from_profile_id,
      'tip_sent',
      -p_amount_cents,
      'Tip sent'
    );
  end if;

  update public.profiles
  set wallet_balance_cents = wallet_balance_cents + p_amount_cents
  where id = p_to_profile_id;

  if not found then
    raise exception 'Recipient profile not found';
  end if;

  insert into public.wallet_transactions (profile_id, type, amount_cents, label)
  values (
    p_to_profile_id,
    'tip_received',
    p_amount_cents,
    coalesce(p_from_name, 'Customer') || ' tipped you'
  );

  insert into public.tips (
    from_profile_id,
    from_name,
    to_profile_id,
    workplace_id,
    amount_cents,
    nps_score
  )
  values (
    p_from_profile_id,
    p_from_name,
    p_to_profile_id,
    p_workplace_id,
    p_amount_cents,
    p_nps_score
  )
  returning * into v_tip;

  return v_tip;
end;
$$;

-- Row level security (API uses service role; policies ready for future auth)
alter table public.workplaces enable row level security;
alter table public.profiles enable row level security;
alter table public.tips enable row level security;
alter table public.wallet_transactions enable row level security;

create policy "Public read workplaces"
  on public.workplaces for select
  using (true);

create policy "Public read employee profiles by code"
  on public.profiles for select
  using (employee_code is not null);

-- Demo seed data
insert into public.workplaces (id, name, slug, business_code, logo_emoji) values
  ('11111111-1111-1111-1111-111111111101', 'Starbucks', 'starbucks', 'SBUX-DEMO', '☕'),
  ('11111111-1111-1111-1111-111111111102', 'Blue Bottle Coffee', 'blue-bottle', 'BB-DEMO', '🫘')
on conflict (slug) do nothing;

insert into public.profiles (id, name, phone, role, employee_code, workplace_id, verified) values
  ('22222222-2222-2222-2222-222222222201', 'Maria Santos', '+15550000001', 'employee', 'MARIA-7K2P', '11111111-1111-1111-1111-111111111101', true),
  ('22222222-2222-2222-2222-222222222202', 'James Chen', '+15550000002', 'employee', 'JAMES-4M9X', '11111111-1111-1111-1111-111111111101', true),
  ('22222222-2222-2222-2222-222222222203', 'Priya Patel', '+15550000003', 'employee', 'PRIYA-2N8Q', '11111111-1111-1111-1111-111111111101', false)
on conflict (employee_code) do nothing;

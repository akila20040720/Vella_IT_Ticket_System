-- VELLA IT SUPPORT schema
create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('admin', 'user');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.ticket_status as enum ('Open', 'Assigned', 'In Progress', 'Waiting User', 'Resolved', 'Closed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.ticket_severity as enum ('Critical', 'High', 'Medium', 'Low');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.ticket_priority as enum ('L1', 'L2', 'L3');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique,
  date_reported date not null,
  reported_by text not null,
  contact text not null,
  property text not null,
  location text not null,
  incident_type text not null,
  system_name text not null,
  severity public.ticket_severity not null,
  priority public.ticket_priority not null,
  completion_target_hours integer not null check (completion_target_hours > 0),
  description text not null,
  status public.ticket_status not null default 'Open',
  assigned_to uuid references public.users (id) on delete set null,
  created_by uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  file_url text not null,
  file_name text not null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.ticket_comments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null unique references public.tickets (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  feedback_text text,
  submitted_at timestamptz not null default now()
);

create sequence if not exists public.ticket_number_sequence;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.assign_ticket_number()
returns trigger
language plpgsql
as $$
begin
  if new.ticket_number is null or new.ticket_number = '' then
    new.ticket_number := 'TKT-' || extract(year from now())::text || '-' || lpad(nextval('public.ticket_number_sequence')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_tickets_updated_at on public.tickets;
create trigger trg_tickets_updated_at
before update on public.tickets
for each row execute function public.set_updated_at();

drop trigger if exists trg_ticket_number on public.tickets;
create trigger trg_ticket_number
before insert on public.tickets
for each row execute function public.assign_ticket_number();

alter table public.users enable row level security;
alter table public.tickets enable row level security;
alter table public.attachments enable row level security;
alter table public.ticket_comments enable row level security;
alter table public.feedback enable row level security;

create policy "Users can read own profile"
on public.users
for select
to authenticated
using (auth.uid() = id or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Users can manage own profile"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can insert own profile"
on public.users
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can read own tickets"
on public.tickets
for select
to authenticated
using (created_by = auth.uid() or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Users can create tickets"
on public.tickets
for insert
to authenticated
with check (created_by = auth.uid());

create policy "Admins can update tickets"
on public.tickets
for update
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Users can read attachments for own tickets"
on public.attachments
for select
to authenticated
using (exists (
  select 1 from public.tickets t
  where t.id = ticket_id
  and (t.created_by = auth.uid() or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
));

create policy "Users can add attachments to own tickets"
on public.attachments
for insert
to authenticated
with check (exists (select 1 from public.tickets t where t.id = ticket_id and t.created_by = auth.uid()));

create policy "Users can read comments for own tickets"
on public.ticket_comments
for select
to authenticated
using (exists (
  select 1 from public.tickets t
  where t.id = ticket_id
  and (t.created_by = auth.uid() or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
));

create policy "Users can comment on own tickets"
on public.ticket_comments
for insert
to authenticated
with check (exists (select 1 from public.tickets t where t.id = ticket_id and (t.created_by = auth.uid() or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))));

create policy "Users can read feedback for own tickets"
on public.feedback
for select
to authenticated
using (exists (
  select 1 from public.tickets t
  where t.id = ticket_id
  and (t.created_by = auth.uid() or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
));

create policy "Users can add feedback to own tickets"
on public.feedback
for insert
to authenticated
with check (exists (select 1 from public.tickets t where t.id = ticket_id and t.created_by = auth.uid()));

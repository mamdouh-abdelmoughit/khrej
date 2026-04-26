-- Create the Profiles table mapping to auth.users
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  organization_name text,
  phone text,
  role text, -- 'visitor' or 'organizer'
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

alter table public.profiles add column if not exists organization_name text;
alter table public.profiles add column if not exists is_verified boolean default false;

-- Enable RLS and add basic policies for profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Auto-create profile row from signup metadata (role/first/last name)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_role text;
  metadata_full_name text;
  metadata_is_verified boolean;
begin
  metadata_role := coalesce(new.raw_user_meta_data->>'role', 'visitor');
  metadata_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', '') || ' ' || coalesce(new.raw_user_meta_data->>'last_name', '')), '')
  );

  metadata_is_verified := case
    when metadata_role = 'organizer' then false
    else true
  end;

  insert into public.profiles (id, full_name, organization_name, phone, role, is_verified)
  values (
    new.id,
    metadata_full_name,
    nullif(new.raw_user_meta_data->>'organization_name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    metadata_role,
    metadata_is_verified
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    organization_name = excluded.organization_name,
    phone = excluded.phone,
    role = excluded.role,
    is_verified = excluded.is_verified;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Create the Events table
create table public.events (
  id uuid not null default gen_random_uuid(),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  cover_image_url text,
  venue_name text not null,
  venue_city text not null,
  event_date timestamp with time zone not null,
  ticket_price numeric not null,
  ticket_quantity integer not null,
  tickets_sold integer not null default 0,
  status text not null default 'draft', -- 'draft', 'published', 'cancelled'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Enable RLS and add basic policies for events
alter table public.events enable row level security;
create policy "Published events are viewable by everyone." on public.events for select using (status = 'published' or auth.uid() = organizer_id);

drop policy if exists "Organizers can create events" on public.events;
drop policy if exists "Organizers can create events." on public.events;
create policy "Organizers can create events" on public.events for insert with check (auth.uid() = organizer_id);

create policy "Organizers can update own events." on public.events for update using (auth.uid() = organizer_id);

-- Create the Orders table
create table public.orders (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  buyer_id uuid references public.profiles(id) on delete set null,
  buyer_email text not null,
  buyer_name text not null,
  buyer_phone text,
  quantity integer not null default 1,
  unit_price numeric not null,
  platform_fee numeric not null,
  total_paid numeric not null,
  status text not null default 'pending', -- 'pending', 'paid', 'cancelled'
  payment_ref text,
  qr_code text not null default gen_random_uuid()::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Enable RLS and add basic policies for orders
alter table public.orders enable row level security;
create policy "Buyers can view their own orders." on public.orders for select using (auth.uid() = buyer_id);
create policy "Organizers can view orders for their events." on public.orders for select using (
  auth.uid() in (
    select organizer_id from public.events where id = event_id
  )
);

-- Optional: Supabase Storage bucket for event covers (requires running in Storage console)
insert into storage.buckets (id, name, public)
values ('event-covers', 'event-covers', true)
on conflict (id) do update
set public = excluded.public;

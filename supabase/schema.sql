-- NutriTrack PRO - schema Supabase (fase 3). Ogni utente vede e modifica SOLO i propri dati (RLS).

-- Profilo, obiettivi, tema e accettazione di privacy/condizioni (una riga per utente).
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  accepted_terms_at timestamptz,
  terms_version text,
  health_consent_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Pasti di un giorno (una riga per utente e giorno, giorno locale dell'utente).
create table if not exists public.day_logs (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  meals jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- Alimenti salvati dall'utente (Open Food Facts, AI, creati a mano, correzioni).
create table if not exists public.foods (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  food jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.profiles enable row level security;
alter table public.day_logs enable row level security;
alter table public.foods enable row level security;

drop policy if exists "profilo: solo il proprio" on public.profiles;
create policy "profilo: solo il proprio" on public.profiles for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "giorni: solo i propri" on public.day_logs;
create policy "giorni: solo i propri" on public.day_logs for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "alimenti: solo i propri" on public.foods;
create policy "alimenti: solo i propri" on public.foods for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Alla registrazione: riga del profilo con l'accettazione inviata dal modulo (metadati dell'utente).
create or replace function public.nuovo_utente() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, accepted_terms_at, terms_version, health_consent_at)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'accepted_terms_at', '')::timestamptz,
    new.raw_user_meta_data ->> 'terms_version',
    nullif(new.raw_user_meta_data ->> 'health_consent_at', '')::timestamptz
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists nuovo_utente on auth.users;
create trigger nuovo_utente after insert on auth.users
  for each row execute function public.nuovo_utente();

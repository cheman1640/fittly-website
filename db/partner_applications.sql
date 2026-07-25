-- Tabla de aplicaciones al Fittly Partner Program (form de fittlyapp.com/partners)
-- Correr en el SQL Editor de Supabase. Mismo patrón que `waitlist`:
-- anon solo puede INSERTAR — nunca leer, actualizar ni borrar.

create table if not exists partner_applications (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  track         text not null check (track in ('creator', 'agency')),
  name          text not null,
  email         text not null,
  handle        text,
  channel       text,
  audience_size text,
  message       text,
  -- gestión interna (no las toca el form)
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  ref_code      text unique,
  notes         text
);

alter table partner_applications enable row level security;

create policy "anon insert only"
  on partner_applications
  for insert
  to anon
  with check (true);

-- Sin política de SELECT para anon: las aplicaciones solo se leen
-- desde el dashboard de Supabase o con la service key.

-- ============================================================
-- DOGGIE GOURMET — PIN del punto de venta validado en el servidor
--
-- Problema (confirmado en el Paso 0.4 del script anterior):
--   - anon puede INSERTAR en inventory_reports e inventory_report_items
--     sin PIN: el PIN solo se revisaba en el navegador.
--   - anon puede LEER inventory_reports ("can read inserted row",
--     qual = true): la llave pública lee todos los reportes.
--   - verify_pin se puede llamar sin límite: 10,000 PINs posibles.
--
-- Solución:
--   - public.pos_login(p_pin)                        → reemplaza a verify_pin
--   - public.submit_inventory_report(p_pin, p_items) → reemplaza los inserts
--   Las dos revisan el PIN en el servidor y limitan los intentos fallidos.
--   El navegador ya no toca las tablas de reportes.
--
-- Orden para correrlo (cada parte por separado, en el SQL Editor):
--   PARTE 0  diagnóstico (solo lectura)              → antes de todo
--   PARTE A  crear funciones (no rompe nada)         → antes de probar la rama
--   PRUEBAS A
--   ...probar la rama localmente, hacer merge, esperar el deploy...
--   PARTE B  quitar el acceso directo a anon         → DESPUÉS del merge
--   PRUEBAS B
--
-- Si corres la Parte B antes de que el sitio nuevo esté publicado, el
-- sitio viejo deja de poder enviar reportes.
-- ============================================================


-- ------------------------------------------------------------
-- PARTE 0 — Diagnóstico (solo lectura). Guarda el resultado:
-- lo necesitas para revertir.
-- ------------------------------------------------------------

-- 0.1 Firma y definición de verify_pin. La Parte B asume que la
--     firma es exactamente  verify_pin(p_pin text).
select p.oid::regprocedure            as firma,
       p.prosecdef                    as security_definer,
       pg_get_function_result(p.oid)  as devuelve,
       pg_get_functiondef(p.oid)      as definicion
from pg_proc p
where p.pronamespace = 'public'::regnamespace and p.proname = 'verify_pin';

-- 0.2 Políticas actuales de las tablas de reportes (cópialas a un lado)
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('inventory_reports', 'inventory_report_items')
order by tablename, cmd;

-- 0.3 Permisos de tabla actuales
select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privilegios
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('inventory_reports', 'inventory_report_items')
group by 1, 2
order by 1, 2;

-- 0.4 FORCE RLS debe estar en false (si no, las funciones no podrían insertar)
select relname, relrowsecurity, relforcerowsecurity
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('inventory_reports', 'inventory_report_items');

-- 0.5 Cuántos reportes ve hoy el master (para comparar en las pruebas B)
select count(*) from public.inventory_reports;


-- ------------------------------------------------------------
-- PARTE A — Crear las funciones nuevas. Solo agrega cosas: el
-- sitio actual sigue funcionando igual.
-- ------------------------------------------------------------
begin;

-- Esquema interno: PostgREST no lo expone, así que nadie lo llama por API.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Registro de intentos de PIN (para el límite de intentos fallidos).
create table if not exists public.pos_pin_attempts (
  id           bigint generated always as identity primary key,
  client_ip    text        not null,
  success      boolean     not null,
  attempted_at timestamptz not null default now()
);
create index if not exists pos_pin_attempts_attempted_at_idx
  on public.pos_pin_attempts (attempted_at);
alter table public.pos_pin_attempts enable row level security;  -- sin políticas a propósito
revoke all on public.pos_pin_attempts from anon, authenticated;

-- IP del cliente según los headers que PostgREST recibe.
create or replace function private.request_ip()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(
    nullif(btrim(nullif(current_setting('request.headers', true), '')::json ->> 'cf-connecting-ip'), ''),
    nullif(btrim(split_part(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ',', 1)), ''),
    'unknown'
  );
$$;

-- Valida el PIN con límite de intentos fallidos:
--   5 por IP y 30 en total, en una ventana de 15 minutos.
-- Devuelve el perfil del punto de venta, o null si el PIN no es válido.
create or replace function private.pos_check_pin(p_pin text)
returns jsonb
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_ip   text := private.request_ip();
  v_row  jsonb;
begin
  if p_pin is null or p_pin !~ '^[0-9]{4,8}$' then
    raise exception 'invalid_pin_format' using errcode = '22023';
  end if;

  -- Serializa las validaciones para que los límites no se brinquen
  -- mandando muchas peticiones en paralelo.
  perform pg_advisory_xact_lock(hashtext('dg_pos_pin_attempts'));

  delete from public.pos_pin_attempts where attempted_at < now() - interval '1 day';

  if (select count(*) from public.pos_pin_attempts a
        where not a.success and a.client_ip = v_ip
          and a.attempted_at > now() - interval '15 minutes') >= 5
     or (select count(*) from public.pos_pin_attempts a
        where not a.success
          and a.attempted_at > now() - interval '15 minutes') >= 30 then
    raise exception 'too_many_attempts' using errcode = 'P0001';
  end if;

  select to_jsonb(v) into v_row
  from public.verify_pin(p_pin) as v
  where v.role = 'pos'
  limit 1;

  insert into public.pos_pin_attempts (client_ip, success)
  values (v_ip, v_row is not null);

  if v_row is null then
    return null;
  end if;

  -- Solo los campos que usa el formulario (nunca el PIN ni otros).
  return jsonb_build_object(
    'id',       v_row -> 'id',
    'role',     v_row -> 'role',
    'business', v_row -> 'business',
    'contact',  v_row -> 'contact',
    'phone',    v_row -> 'phone',
    'city',     v_row -> 'city'
  );
end;
$$;

revoke all on all functions in schema private from public, anon, authenticated;

-- Login del punto de venta (reemplaza la llamada directa a verify_pin).
create or replace function public.pos_login(p_pin text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  return private.pos_check_pin(p_pin);
end;
$$;

-- Envío del reporte. Vuelve a validar el PIN y toma pos_id, business y
-- contact del perfil del servidor, no de lo que mande el navegador.
-- p_items: [{ "product": text, "requested": number, "notes": text|null }]
-- Devuelve el reporte creado, o null si el PIN ya no es válido.
create or replace function public.submit_inventory_report(p_pin text, p_items jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_profile jsonb;
  v_report  public.inventory_reports;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'invalid_items' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) not between 1 and 100 then
    raise exception 'invalid_items' using errcode = '22023';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_items) as e
    where case
      when jsonb_typeof(e) <> 'object'                                        then true
      when coalesce(jsonb_typeof(e -> 'product'), 'missing') <> 'string'      then true
      when length(btrim(e ->> 'product')) not between 1 and 200               then true
      when coalesce(jsonb_typeof(e -> 'requested'), 'missing') <> 'number'    then true
      when (e ->> 'requested')::numeric not between 0 and 100000              then true
      when coalesce(jsonb_typeof(e -> 'notes'), 'null') not in ('string', 'null') then true
      when length(coalesce(e ->> 'notes', '')) > 1000                         then true
      else false
    end
  ) then
    raise exception 'invalid_items' using errcode = '22023';
  end if;

  v_profile := private.pos_check_pin(p_pin);
  if v_profile is null then
    return null;
  end if;

  -- jsonb_populate_record adapta los valores a los tipos reales de las
  -- columnas (pos_id puede ser text o uuid, status texto o enum).
  insert into public.inventory_reports (pos_id, business, contact, status)
  select r.pos_id, r.business, r.contact, r.status
  from jsonb_populate_record(null::public.inventory_reports, jsonb_build_object(
    'pos_id',   v_profile -> 'id',
    'business', v_profile -> 'business',
    'contact',  v_profile -> 'contact',
    'status',   'Recibido'
  )) as r
  returning * into v_report;

  insert into public.inventory_report_items (report_id, product, requested, notes)
  select v_report.id, r.product, r.requested, r.notes
  from jsonb_populate_recordset(null::public.inventory_report_items, (
    select jsonb_agg(jsonb_build_object(
             'product',   btrim(t.e ->> 'product'),
             'requested', t.e -> 'requested',
             'notes',     nullif(btrim(coalesce(t.e ->> 'notes', '')), '')
           ) order by t.n)
    from jsonb_array_elements(p_items) with ordinality as t(e, n)
  )) as r;

  return to_jsonb(v_report);
end;
$$;

revoke all on function public.pos_login(text)                      from public;
revoke all on function public.submit_inventory_report(text, jsonb) from public;
grant execute on function public.pos_login(text)                      to anon, authenticated;
grant execute on function public.submit_inventory_report(text, jsonb) to anon, authenticated;

commit;


-- ------------------------------------------------------------
-- PRUEBAS A — Cada bloque termina en ROLLBACK: no deja nada guardado.
-- Cambia <PIN_REAL> por el PIN de un punto de venta.
-- ------------------------------------------------------------

-- A.1 PIN incorrecto → null.  PIN real → perfil (id, business, contact...).
begin;
set local role anon;
select public.pos_login('0000')        as pin_incorrecto;
select public.pos_login('<PIN_REAL>')  as pin_real;
rollback;

-- A.2 Envío de reporte → JSON con id, submitted_at, pos_id, status = Recibido.
begin;
set local role anon;
select public.submit_inventory_report(
  '<PIN_REAL>',
  '[{"product":"Prueba SQL","requested":2,"notes":null}]'::jsonb
);
rollback;

-- A.3 Límite: el 6.º intento fallido seguido debe dar ERROR too_many_attempts.
begin;
set local role anon;
select public.pos_login('0001');
select public.pos_login('0002');
select public.pos_login('0003');
select public.pos_login('0004');
select public.pos_login('0005');
select public.pos_login('0006');  -- ← aquí: ERROR too_many_attempts
rollback;


-- ------------------------------------------------------------
-- PARTE B — Cerrar el acceso directo. SOLO después de hacer merge
-- del PR y de comprobar que el sitio publicado ya usa pos_login.
-- ------------------------------------------------------------
begin;

-- Sin permisos de tabla, anon ya no puede leer ni insertar reportes,
-- sin importar qué políticas haya.
revoke all on public.inventory_reports      from anon;
revoke all on public.inventory_report_items from anon;

-- Limpieza: borra las políticas que son SOLO para anon en estas tablas
-- (entre ellas "can read inserted row" si su rol es {anon}). Las
-- políticas con rol {public} o {authenticated} no se tocan, porque el
-- master puede depender de ellas.
do $$
declare
  p record;
begin
  for p in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('inventory_reports', 'inventory_report_items')
      and roles = '{anon}'::name[]
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
    raise notice 'Política borrada: %.%', p.tablename, p.policyname;
  end loop;
end;
$$;

-- verify_pin ya no se llama desde el navegador; sin esto se podría
-- seguir probando PINs sin límite. pos_login la sigue usando por dentro.
revoke execute on function public.verify_pin(text) from public, anon, authenticated;

commit;

-- Revisa qué quedó (si "can read inserted row" sigue aquí con rol
-- {public}, avísame antes de tocarla: puede ser la que usa el master).
select tablename, policyname, roles, cmd, qual
from pg_policies
where schemaname = 'public'
  and tablename in ('inventory_reports', 'inventory_report_items')
order by tablename, cmd;


-- ------------------------------------------------------------
-- PRUEBAS B — Corre cada bloque por separado: los que esperan
-- ERROR detienen el resto del script si los corres juntos.
-- ------------------------------------------------------------

-- B.1 anon no puede leer reportes → ERROR permission denied
begin; set local role anon;
select count(*) from public.inventory_reports;
rollback;

-- B.2 anon no puede insertar reportes → ERROR permission denied
begin; set local role anon;
insert into public.inventory_reports (pos_id, business, contact, status)
values ('vitalpets', 'prueba', 'prueba', 'Recibido');
rollback;

-- B.3 anon no puede llamar verify_pin → ERROR permission denied
begin; set local role anon;
select * from public.verify_pin('0000');
rollback;

-- B.4 pos_login sigue funcionando → perfil
begin; set local role anon;
select public.pos_login('<PIN_REAL>');
rollback;

-- B.5 El master sigue viendo todos los reportes → mismo número que 0.5
--     (<UUID_DEL_MASTER>: select id, email from auth.users;)
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"role":"authenticated","sub":"<UUID_DEL_MASTER>"}', true);
select count(*) from public.inventory_reports;
rollback;


-- ------------------------------------------------------------
-- MANTENIMIENTO
-- ------------------------------------------------------------

-- Ver intentos recientes (sirve para confirmar que client_ip trae la IP
-- real y no 'unknown'):
-- select client_ip, success, attempted_at from public.pos_pin_attempts
-- order by attempted_at desc limit 20;

-- Desbloquear a un punto de venta que se equivocó varias veces:
-- delete from public.pos_pin_attempts where not success;


-- ------------------------------------------------------------
-- REVERTIR (emergencia)
-- ------------------------------------------------------------

-- Revertir la Parte B (vuelve a abrir el acceso directo; recrea a mano
-- las políticas borradas usando lo que guardaste en 0.2):
-- begin;
-- grant select, insert on public.inventory_reports, public.inventory_report_items to anon;
-- grant execute on function public.verify_pin(text) to anon, authenticated;
-- commit;

-- Revertir la Parte A (solo si el sitio ya volvió a la versión anterior):
-- begin;
-- drop function if exists public.submit_inventory_report(text, jsonb);
-- drop function if exists public.pos_login(text);
-- drop function if exists private.pos_check_pin(text);
-- drop function if exists private.request_ip();
-- drop table if exists public.pos_pin_attempts;
-- commit;

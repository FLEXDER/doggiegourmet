-- ============================================================
-- DOGGIE GOURMET — Arreglo de alertas del Security Advisor
--   0010_security_definer_view:
--     public.online_orders_with_items
--     public.pos_inventory_summary
--
-- Correr a mano en el SQL Editor de Supabase (como postgres).
-- Este archivo NO se ejecuta solo: es para tenerlo versionado.
--
-- Quién usa cada vista (según el código del repo):
--   - pos_inventory_summary: solo InventoryView (inv-inventory.jsx),
--     dentro del MasterDashboard, con la sesión del master (rol
--     `authenticated`).
--   - online_orders_with_items: nadie en el frontend. El carrito
--     guarda pedidos con la Edge Function `submit-order`, que no lee
--     esta vista.
-- ============================================================


-- ------------------------------------------------------------
-- PASO 0 — Diagnóstico (solo lectura). Corre esto primero y
-- guarda el resultado: lo vas a querer para comparar y para
-- revertir.
-- ------------------------------------------------------------

-- 0.1 Definición, dueño y opciones actuales de las vistas
select c.relname                     as vista,
       pg_get_userbyid(c.relowner)   as owner,
       c.reloptions                  as opciones,   -- null = security definer (default)
       pg_get_viewdef(c.oid, true)   as definicion
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('online_orders_with_items', 'pos_inventory_summary');

-- 0.2 Tablas base que lee cada vista
select view_name, table_name
from information_schema.view_table_usage
where view_schema = 'public'
  and view_name in ('online_orders_with_items', 'pos_inventory_summary')
order by 1, 2;

-- 0.3 Quién tiene permisos sobre las vistas hoy
select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privilegios
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('online_orders_with_items', 'pos_inventory_summary')
group by 1, 2
order by 1, 2;

-- 0.4 RLS y políticas de TODAS las tablas de public
select c.relname as tabla, c.relrowsecurity as rls_activo
from pg_class c
where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
order by 1;

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, cmd;

-- 0.5 Cuántas filas ve hoy el master (para comparar después del arreglo)
select count(*) from public.pos_inventory_summary;


-- ------------------------------------------------------------
-- PASO 1 — El arreglo.
--
-- security_invoker = true: la vista se evalúa con los permisos y
-- las políticas RLS de quien la consulta, no las del dueño
-- (postgres, que se salta RLS). Esto quita la alerta 0010.
--
-- Además se le quita el acceso a `anon` (la llave pública), para
-- que las vistas ya no estén abiertas aunque una tabla base tenga
-- una política demasiado permisiva.
-- ------------------------------------------------------------
begin;

alter view public.pos_inventory_summary    set (security_invoker = true);
alter view public.online_orders_with_items set (security_invoker = true);

-- pos_inventory_summary: solo el master (authenticated) la lee.
revoke all on public.pos_inventory_summary from public, anon, authenticated;
grant select on public.pos_inventory_summary to authenticated;

-- online_orders_with_items: el frontend no la usa. Queda para el
-- SQL Editor / service_role (Edge Functions, scripts internos).
revoke all on public.online_orders_with_items from public, anon, authenticated;
grant select on public.online_orders_with_items to service_role;

commit;


-- ------------------------------------------------------------
-- PASO 2 — Comprobar que el panel de inventario sigue funcionando.
--
-- Con security_invoker la vista respeta el RLS de sus tablas base
-- (ver 0.2). El panel ya lee `inventory_movements` y `products`
-- directo con la sesión del master, así que esas tablas ya dejan
-- leer a `authenticated`. Si la vista también lee otra tabla (por
-- ejemplo `points_of_sale`) y esa tabla tiene RLS sin política de
-- SELECT para authenticated, el panel saldría vacío: en ese caso
-- crea la política (plantilla al final de este paso).
-- ------------------------------------------------------------

-- 2.1 anon NO debe poder leer (esperado: ERROR permission denied)
begin;
set local role anon;
select count(*) from public.pos_inventory_summary;
rollback;

begin;
set local role anon;
select count(*) from public.online_orders_with_items;
rollback;

-- 2.2 El master SÍ debe ver lo mismo que en 0.5.
--     Reemplaza <UUID_DEL_MASTER> con:
--       select id, email from auth.users;
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"role":"authenticated","sub":"<UUID_DEL_MASTER>"}', true);
select count(*) from public.pos_inventory_summary;           -- igual que 0.5
select * from public.pos_inventory_summary where pos_id = 'vitalpets' limit 5;
rollback;

-- 2.3 Plantilla, SOLO si 2.2 da menos filas que 0.5. Cambia
--     <tabla_base> por la tabla de 0.2 a la que le falte la política.
-- create policy "master puede leer <tabla_base>"
--   on public.<tabla_base> for select to authenticated using (true);


-- ------------------------------------------------------------
-- REVERTIR (solo si algo se rompe y necesitas volver ya).
-- Deja de nuevo las vistas expuestas; úsalo solo de emergencia.
-- ------------------------------------------------------------
-- begin;
-- alter view public.pos_inventory_summary    reset (security_invoker);
-- alter view public.online_orders_with_items reset (security_invoker);
-- grant select on public.pos_inventory_summary    to anon, authenticated;
-- grant select on public.online_orders_with_items to anon, authenticated;
-- commit;


-- ------------------------------------------------------------
-- PASO 3 (opcional, recomendado) — Que `authenticated` signifique
-- "master" y no "cualquiera con cuenta".
--
-- El master entra con supabase.auth.signInWithPassword. Si en
-- Authentication → Sign In / Providers está activo "Allow new users
-- to sign up", cualquiera puede crearse una cuenta con la llave
-- pública y obtener el rol `authenticated`, o sea, ver lo mismo
-- que el master. Lo mínimo: desactivar el registro de usuarios.
--
-- Para blindarlo en la base, una lista de admins y políticas que la
-- usen. Revisa las políticas actuales (0.4) antes de cambiarlas.
-- ------------------------------------------------------------
-- create table if not exists public.admin_users (
--   user_id uuid primary key references auth.users (id) on delete cascade
-- );
-- alter table public.admin_users enable row level security;  -- sin políticas: no se lee por API
-- revoke all on public.admin_users from anon, authenticated;
--
-- create or replace function public.is_admin()
-- returns boolean
-- language sql stable security definer
-- set search_path = ''
-- as $$
--   select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
-- $$;
-- revoke execute on function public.is_admin() from public, anon;
-- grant execute on function public.is_admin() to authenticated;
--
-- insert into public.admin_users (user_id)
--   select id from auth.users where email = '<CORREO_DEL_MASTER>';
--
-- Después, en cada política de lectura/escritura del master, cambia
-- `using (true)` por `using (public.is_admin())`, por ejemplo:
-- alter policy "<nombre_politica>" on public.inventory_movements
--   using (public.is_admin());

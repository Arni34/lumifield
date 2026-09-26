-- ⚙️ Активация подписки Stripe. Вставь в Supabase → SQL Editor → Run.
-- Вебхук (сервер, без JWT пользователя) не может писать в user_data напрямую (RLS),
-- поэтому тариф меняется через защищённую функцию. Меняет только поле tariff,
-- остальной снапшот пользователя не трогает.
create or replace function set_user_tariff(p_user_id uuid, p_tariff text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_tariff not in ('free','plus','package') then
    return false;
  end if;
  insert into user_data (user_id, data)
    values (p_user_id, jsonb_build_object('tariff', p_tariff))
  on conflict (user_id) do update
    set data = jsonb_set(coalesce(user_data.data, '{}'::jsonb), '{tariff}', to_jsonb(p_tariff));
  return true;
end;
$$;
revoke all on function set_user_tariff(uuid, text) from public;
grant execute on function set_user_tariff(uuid, text) to anon, authenticated, service_role;

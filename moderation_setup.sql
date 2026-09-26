-- ⚙️ Защита модерации Lumifield. Вставь ЦЕЛИКОМ в Supabase → SQL Editor → Run.
-- Убирает у анонима прямую запись в submissions и разрешает смену статуса
-- только через защищённую функцию (её зовёт Telegram-вебхук).

-- 1) Анониму/пользователю — только читать каталог и добавлять заявку.
--    Никаких update/delete напрямую (иначе любой с публичным ключом мог бы
--    одобрять спам или удалять заявки).
revoke update, delete on public.submissions from anon, authenticated;
grant select, insert on public.submissions to anon, authenticated;

-- 2) Смена статуса — только через эту функцию (владелец обходит ограничение
--    и возвращает, реально ли обновилась строка).
create or replace function set_submission_status(p_id text, p_status text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('approved','rejected','pending') then
    return false;
  end if;
  update submissions set status = p_status where id = p_id;
  return found; -- true, если заявка найдена и обновлена
end;
$$;
revoke all on function set_submission_status(text, text) from public;
grant execute on function set_submission_status(text, text) to anon, authenticated;

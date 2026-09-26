// Supabase Edge Function: модерация заявок на service-ключе (обходит RLS).
// Публичный anon-ключ по RLS видит только approved и не может менять статусы —
// поэтому админка ходит сюда. Доступ защищён общим секретом ADMIN_SECRET.
//
// Деплой (через дашборд Edge Functions или CLI):
//   supabase functions deploy qadam-admin --no-verify-jwt
//   supabase secrets set ADMIN_SECRET=<придумай-пароль>
// SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY Supabase подставляет сам.
// Фронт:  VITE_ADMIN_ENDPOINT=https://<ref>.functions.supabase.co/qadam-admin
//
// Тело: { secret, action: "list" | "setStatus" | "delete", id?, status? }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } })

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })
  try {
    const { secret, action, id, status } = await req.json()
    if (!secret || secret !== Deno.env.get("ADMIN_SECRET")) return json({ error: "unauthorized" }, 401)

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    if (action === "list") {
      const { data, error } = await admin.from("submissions").select("*").order("submitted_at", { ascending: false })
      if (error) return json({ error: error.message }, 500)
      return json({ submissions: data })
    }
    if (action === "setStatus") {
      if (!["pending", "approved", "rejected"].includes(status)) return json({ error: "bad status" }, 400)
      const { error } = await admin.from("submissions").update({ status }).eq("id", id)
      if (error) return json({ error: error.message }, 500)
      return json({ ok: true })
    }
    if (action === "delete") {
      const { error } = await admin.from("submissions").delete().eq("id", id)
      if (error) return json({ error: error.message }, 500)
      return json({ ok: true })
    }
    return json({ error: "unknown action" }, 400)
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})

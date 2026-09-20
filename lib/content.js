import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase/config";

// Public pages use an anonymous client, even when an administrator is signed in.
export async function getPublicContent(table, id) {
  const config = supabaseConfig();
  if (!config) return { data: id ? null : [], error: "コンテンツの公開準備中です。" };
  if (id && !/^[1-9]\d*$/.test(id)) return { data: null, error: null };
  const supabase = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) },
  });
  let query = supabase.from(table).select("*").eq("is_public", true);
  if (table === "questions") query = query.neq("answer", "");
  const { data, error } = id
    ? await query.eq("id", id).maybeSingle()
    : await query.order("created_at", { ascending: false }).order("id", { ascending: false });
  return { data, error: error ? "コンテンツを取得できませんでした。時間をおいて再度お試しください。" : null };
}

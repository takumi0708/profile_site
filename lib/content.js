import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase/config";
import { defaultProfile } from "@/lib/profile-validation.mjs";

// Public pages use an anonymous client, even when an administrator is signed in.
export async function getPublicContent(table, id, page) {
  const config = supabaseConfig();
  if (!config) return { data: id ? null : [], error: "コンテンツの公開準備中です。" };
  if (id && !/^[1-9]\d*$/.test(id)) return { data: null, error: null };
  const supabase = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) },
  });
  // Check the total first for later pages so an out-of-range offset can redirect
  // instead of PostgREST returning a range error after posts are deleted.
  if (page > 1) {
    let totalQuery = supabase.from(table).select("id", { count: "exact", head: true }).eq("is_public", true);
    if (table === "questions") totalQuery = totalQuery.neq("answer", "");
    const { count, error } = await totalQuery;
    if (error) return { data: [], error: "コンテンツを取得できませんでした。時間をおいて再度お試しください。" };
    if ((page - 1) * 10 >= count) return { data: [], count, error: null };
  }
  let query = supabase.from(table).select("*", page ? { count: "exact" } : undefined).eq("is_public", true);
  if (table === "questions") query = query.neq("answer", "");
  if (id) query = query.eq("id", id).maybeSingle();
  else {
    query = query.order("created_at", { ascending: false }).order("id", { ascending: false });
    if (page) query = query.range((page - 1) * 10, page * 10 - 1);
  }
  const { data, error, count } = await query;
  return { data, count, error: error ? "コンテンツを取得できませんでした。時間をおいて再度お試しください。" : null };
}

export async function getProfile() {
  const config = supabaseConfig();
  if (!config) return { data: defaultProfile, error: true };
  const client = createClient(config.url, config.key, { auth: { persistSession: false }, global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } });
  const { data, error } = await client.from("site_profile").select("*").eq("id", 1).single();
  return { data: data || defaultProfile, error: !!error };
}

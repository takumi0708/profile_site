import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase/config";
import { defaultProfile } from "@/lib/profile-validation.mjs";
import { defaultNavigation } from "@/lib/navigation-validation.mjs";

export async function getNavigation() {
  const config = supabaseConfig();
  if (!config) return { data: defaultNavigation.map(item => ({ ...item, body: item.id === 1 ? defaultProfile.bio : "" })), error: false };
  const client = createClient(config.url, config.key, { auth: { persistSession: false }, global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } });
  const { data, error } = await client.from("navigation_pages").select("*").eq("is_public", true).order("sort_order").order("id");
  return { data: data || defaultNavigation.filter(item => item.href), error: !!error };
}

// Public pages use an anonymous client, even when an administrator is signed in.
export async function getPublicContent(table, id, page, category) {
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
    if (category && table === "questions") totalQuery = totalQuery.eq("category", category);
    const { count, error } = await totalQuery;
    if (error) return { data: [], error: "コンテンツを取得できませんでした。時間をおいて再度お試しください。" };
    if ((page - 1) * 10 >= count) return { data: [], count, error: null };
  }
  let query = supabase.from(table).select("*", page ? { count: "exact" } : undefined).eq("is_public", true);
  if (table === "questions") query = query.neq("answer", "");
  if (category && table === "questions") query = query.eq("category", category);
  if (id) query = query.eq("id", id).maybeSingle();
  else {
    query = query.order("created_at", { ascending: false }).order("id", { ascending: false });
    if (page) query = query.range((page - 1) * 10, page * 10 - 1);
  }
  const { data, error, count } = await query;
  return { data, count, error: error ? "コンテンツを取得できませんでした。時間をおいて再度お試しください。" : null };
}

export async function getCategories() {
  const config = supabaseConfig();
  if (!config) return { data: [], error: true };
  const client = createClient(config.url, config.key, { auth: { persistSession: false }, global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } });
  const { data, error } = await client.rpc("question_categories");
  return { data: data || [], error: !!error };
}

export async function getProfile() {
  const config = supabaseConfig();
  if (!config) return { data: defaultProfile, error: true };
  const client = createClient(config.url, config.key, { auth: { persistSession: false }, global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } });
  const { data, error } = await client.from("site_profile").select("*").eq("id", 1).single();
  return { data: data || defaultProfile, error: !!error };
}

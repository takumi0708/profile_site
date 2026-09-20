import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/admin/login");
  const { data: admin, error: roleError } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (roleError) throw new Error("管理者権限を確認できませんでした。");
  if (!admin) redirect("/admin/login?error=forbidden");
  return supabase;
}

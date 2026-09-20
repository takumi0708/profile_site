import Link from "next/link";
import { LoginForm } from "@/components/admin/Forms";
import { supabaseConfig } from "@/lib/supabase/config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function LoginPage({ searchParams }) {
  const { error } = await searchParams;
  return <main className="mx-auto w-full max-w-lg px-6 py-16">
    <Link href="/" className="text-sm text-muted-foreground">← ホームへ戻る</Link>
    <Card className="mt-8"><CardHeader><CardTitle>管理者ログイン</CardTitle><CardDescription>質問の登録・回答・公開設定を管理します。</CardDescription></CardHeader>
      <CardContent>
        {error === "forbidden" && <p role="alert" className="mb-4 text-sm text-destructive">管理者権限が必要です。</p>}
        {supabaseConfig() ? <LoginForm /> : <p className="text-sm text-muted-foreground">Supabaseが未設定です。READMEのセットアップ手順を完了してください。</p>}
      </CardContent>
    </Card>
  </main>;
}

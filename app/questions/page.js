import Comments from "@/components/Comments";
export default function QuestionsPage() {
  return <main className="mx-auto w-full max-w-5xl px-6 py-16"><p className="text-sm text-muted-foreground">Ask me</p><h1 className="mt-2 text-3xl font-bold">閲覧者からの質問コーナー</h1><p className="mt-4 text-muted-foreground">経験・研究・考え方など、気になることを自由に質問してください。文字のみで投稿でき、回答後に管理者が公開します。</p><Comments kind="general" target="0" /></main>;
}

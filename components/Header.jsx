import Link from "next/link";
import { getNavigation } from "@/lib/content";
import { buttonVariants } from "@/components/ui/button";

export default async function Header() {
  const { data } = await getNavigation();
  return <header className="sticky top-0 z-50 border-b bg-background">
    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
      <Link href="/" className="font-semibold">Interview Portfolio</Link>
      <nav aria-label="メインナビゲーション" className="flex flex-wrap gap-2">
        {data.map(item => <Link key={item.id} href={item.href || `/pages/${item.id}`} className={buttonVariants({ variant: "black", size: "sm" })}>{item.label}</Link>)}
      </nav>
    </div>
  </header>;
}

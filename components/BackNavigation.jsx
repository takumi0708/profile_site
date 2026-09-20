"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";

export default function BackNavigation() {
  const path = usePathname();
  if (path === "/") return null;
  const parent = path.startsWith("/interview/") ? "/interview" : path.startsWith("/projects/") ? "/projects" : path.startsWith("/admin/") && path !== "/admin/login" ? "/admin" : "/";
  return <nav aria-label="戻る" className="mx-auto w-full max-w-5xl px-6 pt-6"><Link className={buttonVariants({ variant: "outline" })} href={parent}>← {parent === "/" ? "ホームへ戻る" : "一覧へ戻る"}</Link></nav>;
}

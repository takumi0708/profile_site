export const defaultNavigation = [
  { id: 1, label: "自己紹介", href: "", body: "", sort_order: 0, is_public: true },
  { id: 2, label: "質問コーナー", href: "/questions", sort_order: 1, is_public: true },
  { id: 3, label: "Interview Q&A", href: "/interview", sort_order: 2, is_public: true },
  { id: 4, label: "Projects", href: "/projects", sort_order: 3, is_public: true },
];

export function parseNavigation(formData) {
  const values = Object.fromEntries(["label", "href", "body"].map(key => [key, String(formData.get(key) || "").trim()]));
  values.sort_order = Number(formData.get("sort_order"));
  values.is_public = formData.get("is_public") === "on";
  if (!values.label || values.label.length > 100) throw new Error("ボタン名は1〜100文字で入力してください。");
  if (!["", "/questions", "/interview", "/projects"].includes(values.href)) throw new Error("リンク先が正しくありません。");
  if (values.body.length > 20000) throw new Error("本文は20,000文字以内で入力してください。");
  if (!Number.isInteger(values.sort_order) || values.sort_order < 0 || values.sort_order > 9999) throw new Error("表示順は0〜9999の整数で入力してください。");
  return values;
}

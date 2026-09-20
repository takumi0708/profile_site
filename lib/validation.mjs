export function parseTags(value) {
  const tags = [...new Set(String(value || "").split(/[,、\n]/).map(v => v.trim()).filter(Boolean))];
  if (tags.length > 10 || tags.some(tag => tag.length > 30)) throw new Error("タグは10個まで、各30文字以内で入力してください。");
  return tags;
}
export function validId(value) {
  return /^[1-9]\d{0,15}$/.test(String(value));
}
export function validateComment(values) {
  if (!(values.kind === "general" && values.target === "0") && (!["questions", "projects"].includes(values.kind) || !validId(values.target))) return "投稿先が正しくありません。";
  if (!values.body || values.body.length > 2000) return "質問・コメントは1〜2,000文字で入力してください。";
  if (values.name.length > 80) return "お名前は80文字以内で入力してください。";
  return null;
}

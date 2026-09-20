export const defaultProfile = { display_name: "Takumi", bio: "面接で聞かれそうな質問への回答や、開発経験・研究内容をまとめています。", links: [] };

export function parseProfileLinks(text) {
  const lines = String(text || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length > 10) throw new Error("リンクは10件まで登録できます。");
  return lines.map(line => {
    const divider = line.indexOf("|");
    const label = line.slice(0, divider).trim();
    const parts = line.slice(divider + 1).split("|");
    const url = parts[0].trim();
    const color = parts[1]?.trim();
    if (parts.length > 2 || (color && !/^#[0-9a-fA-F]{6}$/.test(color))) throw new Error("リンク色は #2563eb のような6桁のカラーコードで入力してください。");
    if (divider < 1 || !label || label.length > 50 || url.length > 2048) throw new Error("リンクは「名前 | https://...」の形式で入力してください。");
    let parsed;
    try { parsed = new URL(url); } catch { throw new Error("リンクのURLを確認してください。"); }
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error("リンクにはhttpまたはhttpsのURLを指定してください。");
    return { label, url: parsed.href, ...(color ? { color } : {}) };
  });
}

export function pageNumber(value) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page <= 1000000 ? page : 1;
}

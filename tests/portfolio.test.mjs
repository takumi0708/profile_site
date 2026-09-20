import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { markdownPreview } from "../lib/markdown.mjs";
import { parseProfileLinks, pageNumber } from "../lib/profile-validation.mjs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

test("previews strip Markdown, preserve emoji clusters, and stop at 20 characters", () => {
  assert.equal(markdownPreview("## **Hello** [world](https://example.com)"), "Hello world");
  assert.equal(markdownPreview("あ".repeat(21)), "あ".repeat(20) + "…");
  assert.equal(markdownPreview("あ".repeat(20)), "あ".repeat(20));
  assert.equal(markdownPreview("👩‍💻".repeat(21)), "👩‍💻".repeat(20) + "…");
  assert.equal(markdownPreview("<script>alert(1)</script>"), "");
});

test("Markdown renders GFM and rejects executable markup", () => {
  const html = renderToStaticMarkup(React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm], skipHtml: true }, "## Heading\n\n**bold**\n\n- item\n\n```js\nlet n = 1;\n```\n\n<script>alert(1)</script>\n\n[x](javascript:alert%281%29)"));
  assert.ok(html.includes("<h2>Heading</h2>"));
  assert.ok(html.includes("<strong>bold</strong>"));
  assert.ok(html.includes("<li>item</li>"));
  assert.ok(html.includes("<pre>"));
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("javascript:"));
});

test("profile links and page parameters validate external input", () => {
  assert.deepEqual(parseProfileLinks("X | https://x.com/test\nGitHub | https://github.com/test"), [{ label: "X", url: "https://x.com/test" }, { label: "GitHub", url: "https://github.com/test" }]);
  for (const text of ["X | javascript:alert(1)", "X | data:text/html,test", "X | https://user:pass@example.com", "bad"]) assert.throws(() => parseProfileLinks(text));
  assert.deepEqual(parseProfileLinks(""), []);
  for (const value of [undefined, "0", "-1", "NaN", "1.5", ["2"], "9007199254740992"]) assert.equal(pageNumber(value), 1);
  assert.equal(pageNumber("2"), 2);
});

test("only admins can change public profile and manage projects", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to anon, authenticated;`);
    for (const file of ["202609200001_initial.sql", "202609200004_profile.sql"]) await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"));
    await db.exec(`insert into auth.users values ('00000000-0000-0000-0000-000000000001');
      insert into public.admins values ('00000000-0000-0000-0000-000000000001'); set role anon;`);
    assert.equal((await db.query("select display_name from public.site_profile")).rows[0].display_name, "Takumi");
    await assert.rejects(db.query("update public.site_profile set display_name = 'Intruder'"), /permission denied/);
    await db.exec("set role authenticated;");
    assert.equal((await db.query("update public.site_profile set display_name='Intruder' returning id")).rows.length, 0);
    await assert.rejects(db.query("insert into public.projects(title,summary) values ('Denied','text')"), /row-level security/);
    await db.exec("set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';");
    await db.exec("update public.site_profile set display_name='Updated', links='[{\"label\":\"X\",\"url\":\"https://x.com/test\"}]'; insert into public.projects(title,summary) values ('Draft','## Markdown');");
    await db.exec("set role anon;");
    assert.equal((await db.query("select * from public.projects")).rows.length, 0);
    assert.equal((await db.query("select display_name from public.site_profile")).rows[0].display_name, "Updated");
    await db.exec("set role authenticated; update public.projects set is_public=true; set role anon;");
    assert.equal((await db.query("select summary from public.projects")).rows[0].summary, "## Markdown");
    await db.exec("set role authenticated; delete from public.projects;");
    assert.equal((await db.query("select * from public.projects")).rows.length, 0);
  } finally { await db.close(); }
});

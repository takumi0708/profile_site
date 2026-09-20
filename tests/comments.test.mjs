import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { parseTags, validateComment } from "../lib/validation.mjs";

test("tags normalize duplicates and enforce bounds; comments validate targets", () => {
  assert.deepEqual(parseTags(" React,React、研究\n SQL "), ["React", "研究", "SQL"]);
  assert.throws(() => parseTags("x".repeat(31)));
  assert.throws(() => parseTags(Array.from({ length: 11 }, (_, i) => i).join(",")));
  assert.ok(validateComment({ kind: "admins", target: "1", body: "hello", name: "" }));
  assert.ok(validateComment({ kind: "questions", target: "-1", body: "hello", name: "" }));
  assert.equal(validateComment({ kind: "questions", target: "1", body: "hello", name: "" }), null);
});

test("migrations enforce comment privacy, moderation, rate limits and deletion permissions", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to anon, authenticated, service_role;
    `);
    for (const file of ["202609200001_initial.sql", "202609200002_comments_tags.sql"]) {
      await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"));
    }
    await db.exec(`
      insert into auth.users values ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
      insert into public.admins values ('00000000-0000-0000-0000-000000000001');
      insert into public.questions (question,answer,category,is_public) values ('Visible','Answer','自由カテゴリ',true), ('Draft','','self',false);
      insert into public.questions (question,answer,category,parent_id) values ('Child','','self',1);
      insert into public.projects(title,summary,is_public) values ('Project','Summary',true);
      set role anon;
    `);
    await assert.rejects(db.query("select * from public.comments"), /permission denied/);
    await assert.rejects(db.query("select public.submit_comment('questions',1,'','hello','fp')"), /permission denied/);
    assert.equal((await db.query("select * from public.public_comments('questions',1)")).rows.length, 0);
    await db.exec("reset role; set role service_role;");
    await assert.rejects(db.query("select public.submit_comment('questions',2,'','hello','fp')"), /INVALID_TARGET/);
    for (let i = 0; i < 3; i++) await db.query("select public.submit_comment('questions',1,'Guest','hello','fp')");
    await assert.rejects(db.query("select public.submit_comment('questions',1,'','hello','fp')"), /RATE_LIMIT/);
    await db.query("select public.submit_comment('projects',1,'Guest','project question','other')");
    await db.exec("reset role; set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';");
    assert.equal((await db.query("select * from public.comments")).rows.length, 0);
    assert.equal((await db.query("delete from public.questions where id = 1 returning id")).rows.length, 0);
    assert.equal((await db.query("update public.comments set is_public = true returning id")).rows.length, 0);
    await db.exec("set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';");
    assert.equal((await db.query("select * from public.comments")).rows.length, 4);
    await assert.rejects(db.query("update public.comments set is_public = true where id = 1"), /check constraint/);
    await db.exec("update public.comments set answer = 'Reply', is_public = true where id = 1; set role anon;");
    const publicRows = (await db.query("select * from public.public_comments('questions',1)")).rows;
    assert.equal(publicRows.length, 1);
    assert.equal(publicRows[0].answer, "Reply");
    assert.equal('notification_sent_at' in publicRows[0], false);
    await db.exec("set role authenticated; update public.questions set is_public = false where id = 1; set role anon;");
    assert.equal((await db.query("select * from public.public_comments('questions',1)")).rows.length, 0);
    await db.exec("set role authenticated; delete from public.questions where id = 1;");
    assert.equal((await db.query("select * from public.comments where question_id = 1")).rows.length, 0);
    assert.equal((await db.query("select parent_id from public.questions where id = 3")).rows[0].parent_id, null);
    await db.exec("delete from public.projects where id = 1;");
    assert.equal((await db.query("select * from public.comments")).rows.length, 0);
    await db.exec("reset role;");
    await db.exec(await readFile(new URL("../supabase/migrations/202609200003_comment_spam_limits.sql", import.meta.url), "utf8"));
    await db.exec("insert into public.projects(title,summary,is_public) values ('Spam test','Summary',true); set role service_role;");
    await db.query("select public.submit_comment('projects',2,'Guest','Same text','new-ip')");
    await assert.rejects(db.query("select public.submit_comment('projects',2,'Other',' SAME   TEXT ','other-ip')"), /DUPLICATE_COMMENT/);
    for (let i = 1; i < 20; i++) {
      await db.query("select public.submit_comment('projects',2,'Guest',$1,$2)", [`unique ${i}`, `ip-${i}`]);
    }
    await assert.rejects(db.query("select public.submit_comment('projects',2,'Guest','over limit','fresh-ip')"), /GLOBAL_RATE_LIMIT/);
    await db.exec("delete from public.comments;");
    await assert.rejects(db.query("select public.submit_comment('projects',2,'Guest','after deletion','fresh-ip')"), /GLOBAL_RATE_LIMIT/);
    await db.exec("update public.comment_limits set window_start = now() - interval '2 hours' where fingerprint = 'global:hour';");
    await db.query("select public.submit_comment('projects',2,'Guest','new hour','fresh-ip')");
    await db.exec("update public.comment_limits set count = 100 where fingerprint = 'global:day';");
    await assert.rejects(db.query("select public.submit_comment('projects',2,'Guest','day limit','another-ip')"), /GLOBAL_RATE_LIMIT/);
    await db.exec("update public.comment_limits set window_start = now() - interval '25 hours' where fingerprint in ('global:hour','global:day');");
    await db.query("select public.submit_comment('projects',2,'Guest','new day','final-ip')");
    await db.exec("reset role;");
    await db.exec(await readFile(new URL("../supabase/migrations/202609210006_question_corner.sql", import.meta.url), "utf8"));
    await db.exec("set role service_role;");
    await assert.rejects(db.query("select public.submit_comment('general',7,'','bad','corner-ip')"), /INVALID_TARGET/);
    await db.query("select public.submit_comment('general',0,'Guest','Text only question','corner-ip')");
    await assert.rejects(db.query("select public.submit_comment('general',0,'','Text only question','corner-ip2')"), /DUPLICATE_COMMENT/);
    await db.exec("set role anon;");
    assert.equal((await db.query("select * from public.public_comments('general',0)")).rows.length, 0);
    await assert.rejects(db.query("select public.submit_comment('general',0,'','bypass','x')"), /permission denied/);
    await db.exec("set role authenticated; update public.comments set answer='Plain answer', is_public=true where is_general;");
    await db.exec("set role anon;");
    assert.equal((await db.query("select * from public.public_comments('general',0)")).rows[0].answer, 'Plain answer');
    assert.equal((await db.query("select * from public.question_categories()")).rows.length, 0);
    await db.exec("set role authenticated; insert into public.questions(question,answer,category,is_public) values ('Visible','Answer','category A',true), ('Draft','','private category',false);");
    await db.exec("set role anon;");
    assert.deepEqual((await db.query("select * from public.question_categories()")).rows, [{ category: 'category A' }]);
  } finally { await db.close(); }
});

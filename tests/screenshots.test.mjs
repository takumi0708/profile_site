import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("screenshot bucket allows only admins to insert, list and delete objects", async () => {
  const db = new PGlite();
  try {
    // Local stand-in for Supabase's storage tables; HTTP MIME/size checks remain integration checks.
    await db.exec(`create role anon; create role authenticated;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to anon, authenticated;
      create schema storage;
      create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      create table storage.objects(id integer generated always as identity, bucket_id text, name text);
      alter table storage.objects enable row level security;
      grant usage on schema storage to anon, authenticated;
      grant select, insert, delete on storage.objects to anon, authenticated;
      grant usage on sequence storage.objects_id_seq to anon, authenticated;`);
    for (const file of ["202609200001_initial.sql", "202609210005_screenshots.sql"]) await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"));
    const bucket = (await db.query("select * from storage.buckets")).rows[0];
    assert.equal(Number(bucket.file_size_limit), 5242880);
    assert.deepEqual(bucket.allowed_mime_types, ['image/png', 'image/jpeg', 'image/webp']);
    await db.exec(`insert into auth.users values ('00000000-0000-0000-0000-000000000001');
      insert into public.admins values ('00000000-0000-0000-0000-000000000001'); set role anon;`);
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('screenshots','anon.png')"), /row-level security/);
    await db.exec("set role authenticated;");
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('screenshots','user.png')"), /row-level security/);
    await db.exec("set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';");
    await db.exec("insert into storage.objects(bucket_id,name) values ('screenshots','admin.png');");
    assert.equal((await db.query("select * from storage.objects")).rows.length, 1);
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('other','admin.png')"), /row-level security/);
    await db.exec("set request.jwt.claim.sub='';");
    assert.equal((await db.query("delete from storage.objects returning id")).rows.length, 0);
    assert.equal((await db.query("select * from storage.objects")).rows.length, 0);
    await db.exec("set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';");
    assert.equal((await db.query("delete from storage.objects returning id")).rows.length, 1);
  } finally { await db.close(); }
});

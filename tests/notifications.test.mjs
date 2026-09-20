import { test } from "node:test";
import assert from "node:assert/strict";
import { notifyComment } from "../lib/notifications.js";

test("visitor notifications use fixed recipients, preserve pending failures, and skip sent comments", async () => {
  const oldFetch = globalThis.fetch;
  const keys = ["RESEND_API_KEY", "NOTIFICATION_EMAIL", "NOTIFICATION_FROM"];
  const oldEnv = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  let updates = 0;
  let requests = 0;
  const db = { from: () => ({ update: () => ({ eq: async () => { updates++; return { error: null }; } }) }) };
  const comment = { id: 7, body: "<script>sample</script>", author_name: "Guest", question_id: 1 };
  try {
    keys.forEach(k => delete process.env[k]);
    globalThis.fetch = async () => { throw new Error("Must not send without config"); };
    assert.equal(await notifyComment(db, comment), false);
    assert.equal(updates, 0);
    process.env.RESEND_API_KEY = "test-key";
    process.env.NOTIFICATION_EMAIL = "owner@example.com";
    process.env.NOTIFICATION_FROM = "site@example.com";
    globalThis.fetch = async () => ({ ok: false });
    assert.equal(await notifyComment(db, comment), false);
    assert.equal(updates, 0);
    globalThis.fetch = async () => { throw new Error("timeout"); };
    assert.equal(await notifyComment(db, comment), false);
    globalThis.fetch = async (url, options) => {
      requests++;
      assert.equal(url, "https://api.resend.com/emails");
      assert.equal(options.headers["Idempotency-Key"], "visitor-comment-7");
      const payload = JSON.parse(options.body);
      assert.deepEqual(payload.to, ["owner@example.com"]);
      assert.equal(payload.html, undefined);
      assert.ok(payload.text.includes(comment.body));
      return { ok: true };
    };
    assert.equal(await notifyComment(db, comment), true);
    assert.equal(updates, 1);
    assert.equal(await notifyComment(db, { ...comment, notification_sent_at: "2026-09-20" }), true);
    assert.equal(requests, 1);
  } finally {
    globalThis.fetch = oldFetch;
    keys.forEach(k => oldEnv[k] === undefined ? delete process.env[k] : process.env[k] = oldEnv[k]);
  }
});

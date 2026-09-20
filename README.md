# Interview Portfolio

就職活動向けの自己紹介・ポートフォリオサイト。

一般的な作品紹介ではなく、  
**面接で聞かれそうなQ&Aを中心に、自分の考え・経験・技術を深く知ってもらうサイト**を目指す。

## 主な機能

- Top
  - 自己紹介
  - GitHub等へのリンク
  - Q&Aへの導線

- Interview / Technical Q&A
  - 面接で聞かれそうな質問
  - 技術面接で聞かれそうな質問
  - 回答を詳しく掲載

- Q&A深掘り
  - 各回答に追加質問できる
  - 質問を親子関係で管理
  - 回答済みのものだけ公開

- Projects
  - 開発経験
  - 使用技術
  - 担当内容
  - 学んだこと

- Research
  - 研究テーマ
  - 目的
  - 解析内容
  - 今後の方針

- Skills
  - 技術名
  - 実際に何に使ったか

- Admin
  - 質問確認
  - 回答
  - 公開 / 非公開管理

## 使用技術

- Next.js
- React
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Vercel
- GitHub Actions
- Codex 

## Q&Aデータ

```text
questions
- id
- parent_id
- question
- answer
- category
- is_public
- created_at
- updated_at
```

## Supabaseセットアップ

1. Supabaseプロジェクトを作成し、SQL Editorで
   [`supabase/migrations/202609200001_initial.sql`](supabase/migrations/202609200001_initial.sql) を一度実行します。
   新規テーブル用のSQLです。既存の同名テーブルがある場合は先にスキーマを確認してください。
2. `.env.example` を `.env.local` にコピーして、プロジェクトのURLとPublishable keyを設定します。
   service_role / Secret keyは使いません。
3. SupabaseのAuthentication → Usersで管理者用ユーザーを作成し、メール確認済みの状態にします。
4. 作成したユーザーのUUIDを指定して、SQL Editorで管理者権限を付与します。

   ```sql
   insert into public.admins (user_id)
   values ('管理者ユーザーのUUID')
   on conflict do nothing;
   ```

5. `npm install`、`npm run dev` を実行し、`/admin/login` でログインします。
   本番環境にも同じ環境変数を設定して再デプロイしてください。

### 運用

- `/admin` から質問・カテゴリ・回答・親質問（任意）を登録できます。
- 回答なし、または公開チェックなしで下書き保存できます。
- 登録済み質問をクリックすると、回答の編集と公開／非公開の変更ができます。
- `/interview` とその詳細ページは公開済み・回答済みの質問のみ表示します。
- `/projects` もSupabase参照です。ProjectsはSupabaseのTable Editorで登録し、`is_public` を有効にしてください。
- 仮データは自動投入しません。初期状態では空一覧を表示します。
- 管理者権限は`admins`テーブルで管理します。アプリからの権限付与はできません。
  権限を取り消す場合はSQL Editorで該当行を削除します。
- RLSで一般ユーザーによる書き込みと非公開データの取得を制限しています。

認証の実装は[Supabase SSR公式ガイド](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs)を参照しています。

### 動作確認

`npm run lint` と `npm run build` に加え、Supabase接続後に以下を確認してください。

1. 未ログインで`/admin`を開くとログイン画面へ移動する。
2. 管理者権限のないユーザーはログイン後もダッシュボードを利用できない。
3. 管理者で質問を下書き登録し、公開一覧と詳細URLの双方から見えないことを確認する。
4. 回答を入力して公開すると、一覧と詳細ページに反映される。
5. 非公開へ戻すと、公開一覧から消え、詳細URLも404になる。
6. ログアウト後はダッシュボードを利用できない。
7. 一般ユーザーのトークンによるData APIへの直接書き込みがRLSで拒否される。

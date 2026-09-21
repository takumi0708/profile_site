# Interview Portfolio(開発中)

公開中：https://profile-site-cyan.vercel.app/

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

## ヘッダー・自己紹介ページの管理

- 管理画面は `/admin` を直接入力してアクセスします（管理者ログインが必要）。公開ページには管理画面へのボタンを表示しません。
- SupabaseのSQL Editorで既存のマイグレーションに続けて `supabase/migrations/202609210007_navigation.sql` を実行してください。
- 管理画面の「ヘッダーのボタン・ページ管理」でボタンの追加・編集・削除、表示順、公開状態を変更できます。
- リンク先で「独自ページ（Markdown）」を選ぶと、本文を編集できます。公開URLは `/pages/ID` です。
- 自己紹介ページにはSQL実行時のトップページの自己紹介をコピーします。その後はそれぞれ独立して編集できます。
- 独自ページのボタンを削除すると本文も削除されます。非公開の独自ページにはURLからもアクセスできません。

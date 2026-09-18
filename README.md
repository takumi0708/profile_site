# Interview Portfolio

就職活動向けの自己紹介・ポートフォリオサイト。

一般的な作品紹介サイトではなく、
**面接官が実際に質問するようなQ&Aを中心に、自分の考えや経験を深く知ってもらうサイト**を目指す。

---

## 目的

* 自己紹介や就活の軸を整理する
* 面接で聞かれそうな質問への回答を蓄積する
* 技術経験や研究内容を具体的に説明できるようにする
* 閲覧者から追加質問を受け取り、Q&Aをさらに深掘りする
* 就活後も継続して更新できるプロフィールサイトにする

---

## 主な機能

### 1. Top

* 名前
* 簡単な自己紹介
* GitHubなどへのリンク
* Interview Q&Aへの導線

---

### 2. Interview Q&A

面接で聞かれそうな質問と回答を掲載する。

例：

* 自己紹介してください
* なぜエンジニアを志望していますか
* 学生時代に力を入れたことは何ですか
* あなたの強み・弱みは何ですか
* どんなエンジニアになりたいですか
* 就職先を選ぶ上で大切にしていることは何ですか

---

### 3. Technical Q&A

技術面接や技術シートで聞かれそうな内容を掲載する。

例：

* Reactとは何ですか
* Next.jsを使う理由は何ですか
* Dockerとは何ですか
* Azureで何をしましたか
* Git / GitHubをどのように使っていますか
* EEG解析では何をしていますか

回答は、

**結論 → 具体例 → なぜそうしたか → 学んだこと**

の順を基本とする。

---

### 4. Q&Aの深掘り

各Q&Aに「さらに質問する」機能を付ける。

```text
Q. なぜエンジニアを志望していますか？

A. ...

└ Q. なぜ研究職ではないのですか？

   A. ...

   └ Q. 研究経験はエンジニアとしてどう活きますか？

      A. ...
```

質問同士に親子関係を持たせ、Q&Aをツリー状に成長させる。

---

### 5. 質問投稿

閲覧者は各Q&Aから追加質問を送信できる。

投稿された時点では非公開とする。

```text
閲覧者
↓
質問を投稿
↓
DBへ保存
↓
非公開
↓
管理者が回答
↓
公開
```

---

### 6. Admin

自分専用の管理画面。

主な機能：

* 未回答質問の確認
* 回答の入力
* Q&Aの編集
* 公開 / 非公開の切り替え
* カテゴリ管理

---

### 7. Projects

これまでの開発経験を掲載する。

例：

* 動物園画像解析システム
* Webアプリ開発
* 個人開発
* インターンでの開発

各プロジェクトでは、

* 目的
* 背景
* 自分が担当したこと
* 使用技術
* 苦労したこと
* 解決方法
* 学んだこと
* GitHub

を掲載する。

---

### 8. Research

研究内容を、専門外の人にも分かる形で掲載する。

主な内容：

* 研究テーマ
* 背景
* 目的
* 使用データ
* 解析方法
* 現在取り組んでいること
* 今後の方針

---

### 9. Skills

技術名だけでなく、実際に何に使ったかを記載する。

例：

```text
Next.js
→ ポートフォリオ・Webアプリ開発

React
→ UI・状態管理

Python
→ データ解析・画像解析

Docker
→ AI推論環境の構築

Azure
→ クラウド上での処理基盤

MATLAB
→ EEG解析
```

---

## 使用技術

### Frontend

* Next.js
* React
* Tailwind CSS

### Backend

* Next.js Server Actions / API

### Database

* Supabase
* PostgreSQL

### Authentication

* Supabase Auth

### Hosting

* Vercel

### CI/CD

* GitHub
* GitHub Actions
* Vercel

---

## データ構造

Q&Aは親子関係を持たせる。

```text
questions

id
parent_id
question
answer
category
is_public
created_at
updated_at
```

`parent_id`によって追加質問を元の質問に紐付ける。

---

## ページ構成

```text
/
├── interview
│   └── [id]
│
├── projects
│   └── [id]
│
├── research
│
├── skills
│
├── contact
│
└── admin
```

---

## 開発方針

最初からすべて実装せず、段階的に作る。

### Phase 1

* Next.js環境構築
* Topページ
* Interview Q&A一覧
* Q&A詳細ページ
* Projectsページ

### Phase 2

* Supabase接続
* Q&AをDB管理
* 追加質問投稿

### Phase 3

* Admin画面
* 回答機能
* 公開 / 非公開管理
* Q&Aツリー表示

### Phase 4

* Research
* Skills
* デザイン改善
* CI/CD

### Future

* Notion APIとの連携
* 運動記録の自動取得
* Activity Dashboard
* グラフ表示

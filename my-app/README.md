# Snowboard Manager

Personal snowboard log & setting management app.

スノーボードの滑走ログとセッティング（バインディング角度・ハイバック）を  
まとめて管理する個人開発アプリです。

---

## Demo

👉 https://snowboard-manager-ten.vercel.app/

※ ログイン後に各機能を利用できます。

---

## Features

- スノーボード滑走ログの管理
  - ゲレンデ
  - 雪質
  - 混雑度
  - メモ
- セッティング管理
  - 前足 / 後足のバインディング角度
  - ハイバックの倒し具合
- セッティングテンプレート機能
  - テンプレ作成
  - 適用
  - 編集 / 削除
- ログ一覧のフィルタ機能
- ユーザー認証（ログインユーザーごとにデータ分離）

---

## Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Supabase**
  - Authentication
  - Database
  - Row Level Security (RLS)
- **Vercel** (Hosting / Deployment)

---

## Architecture / Notes

- フロントエンドは Next.js（Client Components）で実装
- Supabase Auth を利用したユーザー認証
- データは RLS によりログインユーザー単位でアクセス制御
- Vercel にデプロイし、外部からアクセス可能な形で運用

---

## Motivation

自分自身がスノーボードに行く際、  
「どのゲレンデで・どんな雪質で・どんなセッティングが合ったか」を  
後から振り返れるようにしたいと思い、個人開発として作成しました。

実際の利用を想定し、  
- テンプレ機能  
- フィルタ機能  
- 運用しやすい UI  

を重視して設計しています。

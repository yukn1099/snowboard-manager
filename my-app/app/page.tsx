"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">アプリ選択</h1>
      <p className="text-sm text-gray-600">
        使いたいアプリを選んでください。
      </p>

      <div className="space-y-3">
        <Link
          href="/snowboard"
          className="block border rounded p-4 hover:bg-gray-900"
        >
          <div className="font-medium">スノーボード管理</div>
          <div className="text-sm text-gray-500">
            ゲレンデ / 雪質 / 混雑 / セッティング / テンプレ
          </div>
        </Link>

        <Link
          href="/health"
          className="block border rounded p-4 hover:bg-gray-900"
        >
          <div className="font-medium">体調管理</div>
          <div className="text-sm text-gray-500">
            睡眠 / 気分 / 服薬 / メモ
          </div>
        </Link>
      </div>
    </main>
  );
}

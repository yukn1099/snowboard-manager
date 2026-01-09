"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("ログイン処理中...");

  useEffect(() => {
    const run = async () => {
      try {
        // ① まずPKCE（code付き）を処理（これが今の主流）
        const url = window.location.href;

        // exchangeCodeForSession がある環境ではこれが一番確実
        const anyAuth = supabase.auth as any;
        if (typeof anyAuth.exchangeCodeForSession === "function") {
          const { error } = await anyAuth.exchangeCodeForSession(url);
          if (error) throw error;
        } else if (typeof anyAuth.getSessionFromUrl === "function") {
          // ② 古い形式（hash token）用のフォールバック
          const { error } = await anyAuth.getSessionFromUrl({ storeSession: true });
          if (error) throw error;
        } else {
          // ③ 最後の確認：セッションが入ってるかだけ見る
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!data.session) throw new Error("セッションを取得できませんでした");
        }

        setMsg("ログイン完了。移動します...");
        // ログイン後に飛ばしたい先（好みで変更OK）
        router.replace("/snowboard");
      } catch (e: any) {
        console.error(e);
        setMsg(`ログインに失敗しました: ${e?.message ?? e}`);
      }
    };

    run();
  }, [router]);

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">認証</h1>
      <p className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">{msg}</p>

      {/* 失敗時に逃げ道 */}
      <button
        className="mt-6 underline text-sm"
        onClick={() => router.replace("/login")}
      >
        ログイン画面へ戻る
      </button>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const [msg, setMsg] = useState("ログイン処理中...");

  useEffect(() => {
    const run = async () => {
      try {
        // PKCE（?code=...）をセッションに交換
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );
        if (error) throw error;

        window.location.replace("/snowboard");
      } catch (e: any) {
        console.error(e);
        setMsg(`ログイン失敗: ${e?.message ?? e}`);
      }
    };
    run();
  }, []);

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">認証</h1>
      <p className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">{msg}</p>
    </main>
  );
}

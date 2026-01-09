"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function getHashParams() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  const params = new URLSearchParams(hash);
  return {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
    error_description: params.get("error_description"),
  };
}

export default function AuthCallbackPage() {
  const [msg, setMsg] = useState("ログイン処理中...");

  useEffect(() => {
    const run = async () => {
      try {
        const { access_token, refresh_token, error_description } = getHashParams();

        if (error_description) throw new Error(error_description);
        if (!access_token || !refresh_token) throw new Error("トークンがURLに見つかりませんでした");

        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) throw error;

        // hashを消して見た目もスッキリ（任意だけどおすすめ）
        window.history.replaceState(null, "", window.location.pathname);

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

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const sendMagicLink = async () => {
    if (!email) {
      alert("メールアドレスを入力してね");
      return;
    }

    setSending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setSending(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "ログイン用リンクをメールに送ったよ。\nメールを開いてリンクを押してね。"
    );
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">ログイン</h1>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="you@example.com"
          />
        </div>

        <button
          onClick={sendMagicLink}
          disabled={sending}
          className="border rounded px-4 py-2"
        >
          {sending ? "送信中..." : "ログインリンクを送る"}
        </button>

        <button
          onClick={() => router.push("/")}
          className="underline text-left"
        >
          ← 戻る
        </button>
      </div>
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/new");
      } else {
        router.replace("/login");
      }
    };
    run();
  }, [router]);

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">ログイン処理中...</h1>
      <p className="mt-2 text-sm text-gray-600">少し待ってね</p>
    </main>
  );
}

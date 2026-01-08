"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type TemplateRow = {
  id: string;
  name: string;
  front_angle: number;
  back_angle: number;
  highback: number;
  created_at: string;
};

export default function TemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setEmail(null);
      setTemplates([]);
      setLoading(false);
      return;
    }

    setEmail(user.email ?? "logged-in");

    const { data, error } = await supabase
      .from("snowboard_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setTemplates([]);
    } else {
      setTemplates((data ?? []) as TemplateRow[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteTemplate = async (id: string) => {
    const ok = confirm("このテンプレを削除しますか？（元に戻せません）");
    if (!ok) return;

    setDeletingId(id);
    const { error } = await supabase
      .from("snowboard_templates")
      .delete()
      .eq("id", id);
    setDeletingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    setTemplates((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">テンプレ管理</h1>

      <div className="mt-3 text-sm text-gray-600">
        {email ? <>ログイン中：{email}</> : <>未ログイン</>}
      </div>

      <div className="mt-4 flex gap-3">
        <Link className="underline" href="/snowboard">
          ← スノボ一覧へ
        </Link>
        <Link className="underline" href="/snowboard/new">
          ＋ スノボログ新規
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-600">読み込み中...</p>
      ) : !email ? (
        <p className="mt-6 text-sm text-gray-600">
          ログインするとテンプレが表示されます。
        </p>
      ) : templates.length === 0 ? (
        <p className="mt-6 text-sm text-gray-600">テンプレがありません</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {templates.map((t) => (
            <li key={t.id} className="border rounded p-3">
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-gray-600">
                前 {t.front_angle}° / 後 {t.back_angle}° / HB {t.highback}/10
              </div>

              <div className="mt-3 flex gap-3">
                <Link className="underline" href={`/snowboard/templates/edit/${t.id}`}>
                  編集
                </Link>

                <button
                  className="underline"
                  disabled={deletingId === t.id}
                  onClick={() => deleteTemplate(t.id)}
                >
                  {deletingId === t.id ? "削除中..." : "削除"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

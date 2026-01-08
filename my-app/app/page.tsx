"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type LogRow = {
  id: string;
  log_date: string;
  sleep_hours: number;
  mood: number;
  took_meds: boolean;
  note: string | null;
  user_id: string;
};

export default function HomePage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setEmail(null);
      setLogs([]);
      setLoading(false);
      return;
    }

    setEmail(user.email ?? "logged-in");

    const { data: rows, error } = await supabase
      .from("logs")
      .select("*")
      .order("log_date", { ascending: false });

    if (error) {
      console.error(error);
      setLogs([]);
    } else {
      setLogs((rows ?? []) as LogRow[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteFromList = async (id: string) => {
    const ok = confirm("このログを削除しますか？（元に戻せません）");
    if (!ok) return;

    setDeletingId(id);

    const { error } = await supabase.from("logs").delete().eq("id", id);

    setDeletingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    setLogs((prev) => prev.filter((x) => x.id !== id));
  };

  const logout = async () => {
    const ok = confirm("ログアウトしますか？");
    if (!ok) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
      return;
    }

    // onAuthStateChange でも load が走るけど、体感を速くするため即反映
    setEmail(null);
    setLogs([]);
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">ログ一覧</h1>

      <div className="mt-3 text-sm text-gray-600">
        {email ? <>ログイン中：{email}</> : <>未ログイン</>}
      </div>

      <div className="mt-4 flex gap-3">
        <Link className="underline" href="/new">
          ＋ 新規作成
        </Link>

        {!email ? (
          <Link className="underline" href="/login">
            ログイン
          </Link>
        ) : (
          <button onClick={logout} className="underline">
            ログアウト
          </button>
        )}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-600">読み込み中...</p>
      ) : !email ? (
        <p className="mt-6 text-sm text-gray-600">
          ログインすると自分のログが表示されます。
        </p>
      ) : logs.length === 0 ? (
        <p className="mt-6 text-sm text-gray-600">ログがありません</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {logs.map((log) => (
            <li key={log.id} className="border rounded p-3">
              <div className="font-medium">{log.log_date}</div>
              <div className="text-sm text-gray-600">
                睡眠: {log.sleep_hours}h / 気分: {log.mood} / 服薬:{" "}
                {log.took_meds ? "Yes" : "No"}
              </div>

              {log.note ? (
                <div className="mt-2 text-sm whitespace-pre-wrap">{log.note}</div>
              ) : null}

              <div className="mt-3 flex gap-3">
                <Link className="underline" href={`/edit/${log.id}`}>
                  編集
                </Link>

                <button
                  onClick={() => deleteFromList(log.id)}
                  disabled={deletingId === log.id}
                  className="underline"
                >
                  {deletingId === log.id ? "削除中..." : "削除"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

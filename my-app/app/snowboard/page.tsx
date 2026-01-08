"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

// まだ中身は体調ログのままでOK（動作確認用）
type LogRow = {
  id: string;
  user_id: string;

  ride_date: string;
  resort: string;
  snow_quality: string;
  crowd: number;

  front_angle: number;
  back_angle: number;
  highback: number;

  note: string | null;
};

export default function SnowboardHomePage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [qResort, setQResort] = useState("");
const [qSnow, setQSnow] = useState<string>(""); // "" = 全部
const [qCrowd, setQCrowd] = useState<string>(""); // "" = 全部


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

let query = supabase
  .from("snowboard_logs")
  .select("*")
  .order("ride_date", { ascending: false });

if (qResort.trim()) {
  query = query.ilike("resort", `%${qResort.trim()}%`);
}

if (qSnow) {
  query = query.eq("snow_quality", qSnow);
}

if (qCrowd) {
  query = query.eq("crowd", Number(qCrowd));
}

const { data: rows, error } = await query;



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
}, [qResort, qSnow, qCrowd]);



  const deleteFromList = async (id: string) => {
    const ok = confirm("このログを削除しますか？（元に戻せません）");
    if (!ok) return;

    setDeletingId(id);

    const { error } = await supabase
  .from("snowboard_logs")
  .delete()
  .eq("id", id);

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

    setEmail(null);
    setLogs([]);
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">スノボログ一覧（仮）</h1>

      <div className="mt-3 text-sm text-gray-600">
        {email ? <>ログイン中：{email}</> : <>未ログイン</>}
      </div>

      <div className="mt-4 flex gap-3">
        {/* いったん new も仮でOK（まだ作ってなくてもリンクだけ先に置ける） */}
        <Link className="underline" href="/snowboard/new">
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
      <div className="mt-4 grid grid-cols-1 gap-3">
  <input
    className="border rounded p-2"
    value={qResort}
    onChange={(e) => setQResort(e.target.value)}
    placeholder="ゲレンデで検索（例：志賀）"
  />

  <select
    className="border rounded p-2"
    value={qSnow}
    onChange={(e) => setQSnow(e.target.value)}
  >
    <option value="">雪質：すべて</option>
    <option value="powder">パウダー</option>
    <option value="packed">圧雪</option>
    <option value="icy">アイスバーン</option>
    <option value="slush">シャバ雪</option>
  </select>

  <select
    className="border rounded p-2"
    value={qCrowd}
    onChange={(e) => setQCrowd(e.target.value)}
  >
    <option value="">混雑：すべて</option>
    <option value="1">1（空いてる）</option>
    <option value="2">2</option>
    <option value="3">3（普通）</option>
    <option value="4">4</option>
    <option value="5">5（激混み）</option>
  </select>

  <button
    className="border rounded p-2"
    onClick={() => {
      setQResort("");
      setQSnow("");
      setQCrowd("");
    }}
  >
    フィルタ解除
  </button>
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
              <div className="font-medium">{log.ride_date}</div>

              {/* 表示文言だけ“スノボっぽく”してる（中身は仮） */}
<div className="font-medium">{log.ride_date}</div>

<div className="text-sm text-gray-600">
  ゲレンデ: {log.resort} / 雪質: {log.snow_quality} / 混雑: {log.crowd}/5
</div>

<div className="text-sm text-gray-600">
  セッティング: 前 {log.front_angle}° / 後 {log.back_angle}° / ハイバック {log.highback}/10
</div>


              {log.note ? (
                <div className="mt-2 text-sm whitespace-pre-wrap">{log.note}</div>
              ) : null}

              <div className="mt-3 flex gap-3">
                <Link className="underline" href={`/snowboard/edit/${log.id}`}>
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

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type LogRow = {
  id: string;
  log_date: string;
  sleep_hours: number;
  mood: number;
  took_meds: boolean;
  note: string | null;
};

export default function EditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [logDate, setLogDate] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [mood, setMood] = useState("3");
  const [tookMeds, setTookMeds] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      setLoading(true);

      // ログイン確認（RLS: authenticated前提）
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("ログインしていません。/login からログインしてください");
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("logs")
        .select("id, log_date, sleep_hours, mood, took_meds, note")
        .eq("id", id)
        .single<LogRow>();

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      setLogDate(data.log_date); // YYYY-MM-DD の想定
      setSleepHours(String(data.sleep_hours ?? ""));
      setMood(String(data.mood ?? 3));
      setTookMeds(Boolean(data.took_meds));
      setNote(data.note ?? "");

      setLoading(false);
    };

    load();
  }, [id, router]);

  const updateLog = async () => {
    if (!id) return;

    if (!sleepHours) {
      alert("睡眠時間を入力してね（例：6.5）");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("logs")
      .update({
        log_date: logDate,
        sleep_hours: Number(sleepHours),
        mood: Number(mood),
        took_meds: tookMeds,
        note,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  };

  const deleteLog = async () => {
    if (!id) return;

    const ok = confirm("このログを削除しますか？（元に戻せません）");
    if (!ok) return;

    setDeleting(true);

    const { error } = await supabase.from("logs").delete().eq("id", id);

    setDeleting(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  };

  if (!id) {
    return (
      <main className="p-6 max-w-xl mx-auto">
        <p className="text-sm text-gray-600">IDが見つかりません</p>
        <a className="underline" href="/">
          ← 一覧へ
        </a>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">ログ編集</h1>
      <p className="mt-2 text-sm text-gray-600">編集対象ID：{id}</p>

      {loading ? (
        <p className="mt-6 text-sm text-gray-600">読み込み中...</p>
      ) : (
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">日付</label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">睡眠時間（時間）</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="例：6.5"
            />
          </div>

          <div>
            <label className="text-sm font-medium">気分（1〜5）</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="1">1：かなりしんどい</option>
              <option value="2">2：しんどい</option>
              <option value="3">3：普通</option>
              <option value="4">4：良い</option>
              <option value="5">5：かなり良い</option>
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tookMeds}
              onChange={(e) => setTookMeds(e.target.checked)}
            />
            服薬した
          </label>

          <div>
            <label className="text-sm font-medium">メモ</label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={updateLog}
              disabled={saving || deleting}
              className="border rounded px-4 py-2"
            >
              {saving ? "更新中..." : "更新"}
            </button>

            <button
              onClick={deleteLog}
              disabled={saving || deleting}
              className="border rounded px-4 py-2"
            >
              {deleting ? "削除中..." : "削除"}
            </button>

            <a className="underline self-center" href="/">
              ← 一覧へ
            </a>
          </div>
        </div>
      )}
    </main>
  );
}

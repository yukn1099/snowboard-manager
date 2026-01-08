"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewPage() {
  const router = useRouter();

  const [logDate, setLogDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [sleepHours, setSleepHours] = useState("");
  const [mood, setMood] = useState("3");
  const [tookMeds, setTookMeds] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const saveLog = async () => {
    if (!sleepHours) {
      alert("睡眠時間を入力してね（例：6.5）");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("アプリ側でログインしていません");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("logs").insert({
      log_date: logDate,
      sleep_hours: Number(sleepHours),
      mood: Number(mood),
      took_meds: tookMeds,
      note,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">ログ追加</h1>

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

        <button
          onClick={saveLog}
          disabled={saving}
          className="border rounded px-4 py-2"
        >
          {saving ? "保存中..." : "保存"}
        </button>

        <a className="underline" href="/">
          ← 一覧へ
        </a>
      </div>
    </main>
  );
}

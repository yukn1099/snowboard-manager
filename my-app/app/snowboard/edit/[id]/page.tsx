"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type SnowboardLog = {
  id: string;
  user_id: string;
  ride_date: string; // YYYY-MM-DD
  resort: string;
  snow_quality: string;
  crowd: number;
  front_angle: number;
  back_angle: number;
  highback: number;
  note: string | null;
};

export default function SnowboardEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // フォーム
  const [rideDate, setRideDate] = useState("");
  const [resort, setResort] = useState("");
  const [snowQuality, setSnowQuality] = useState("packed");
  const [crowd, setCrowd] = useState(3);
  const [frontAngle, setFrontAngle] = useState(33);
  const [backAngle, setBackAngle] = useState(27);
  const [highback, setHighback] = useState(5);
  const [note, setNote] = useState("");

  const load = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setLoading(false);
      alert(userError.message);
      return;
    }

    if (!user) {
      setLoading(false);
      alert("ログインしてから編集してね");
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("snowboard_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    const row = data as SnowboardLog;

    // ここでフォームに反映
    setRideDate(row.ride_date);
    setResort(row.resort);
    setSnowQuality(row.snow_quality);
    setCrowd(row.crowd);
    setFrontAngle(row.front_angle);
    setBackAngle(row.back_angle);
    setHighback(row.highback);
    setNote(row.note ?? "");

    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async () => {
    if (!resort.trim()) {
      alert("ゲレンデ名を入力してね");
      return;
    }
    if (crowd < 1 || crowd > 5) {
      alert("混雑は1〜5で入力してね");
      return;
    }
    if (highback < 0 || highback > 10) {
      alert("ハイバックは0〜10で入力してね");
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setSaving(false);
      alert(userError.message);
      return;
    }

    if (!user) {
      setSaving(false);
      alert("ログインしてから保存してね");
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("snowboard_logs")
      .update({
        ride_date: rideDate,
        resort: resort.trim(),
        snow_quality: snowQuality,
        crowd,
        front_angle: frontAngle,
        back_angle: backAngle,
        highback,
        note: note.trim() ? note.trim() : null,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/snowboard");
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">スノボログ 編集</h1>

      <div className="mt-4">
        <Link className="underline" href="/snowboard">
          ← 一覧へ戻る
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-600">読み込み中...</p>
      ) : (
        <div className="mt-6 space-y-4">
          <label className="block">
            <div className="text-sm text-gray-600">滑走日</div>
            <input
              type="date"
              className="mt-1 w-full border rounded p-2"
              value={rideDate}
              onChange={(e) => setRideDate(e.target.value)}
            />
          </label>

          <label className="block">
            <div className="text-sm text-gray-600">ゲレンデ名</div>
            <input
              className="mt-1 w-full border rounded p-2"
              value={resort}
              onChange={(e) => setResort(e.target.value)}
              placeholder="例：志賀高原 / 白馬47 など"
            />
          </label>

          <label className="block">
            <div className="text-sm text-gray-600">雪質</div>
            <select
  className="mt-1 w-full border rounded p-2"
  value={snowQuality}
  onChange={(e) => setSnowQuality(e.target.value)}
>
  <option value="powder">パウダー</option>
  <option value="packed">圧雪</option>
  <option value="icy">アイスバーン</option>
  <option value="slush">シャバ雪</option>
</select>

          </label>

          <label className="block">
  <div className="text-sm text-gray-600">混雑</div>
  <select
    className="mt-1 w-full border rounded p-2"
    value={crowd}
    onChange={(e) => setCrowd(Number(e.target.value))}
  >
    <option value={1}>1（空いてる）</option>
    <option value={2}>2</option>
    <option value={3}>3（普通）</option>
    <option value={4}>4</option>
    <option value={5}>5（激混み）</option>
  </select>
</label>


          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <div className="text-sm text-gray-600">前足角度</div>
              <input
                type="number"
                className="mt-1 w-full border rounded p-2"
                value={frontAngle}
                onChange={(e) => setFrontAngle(Number(e.target.value))}
              />
            </label>

            <label className="block">
              <div className="text-sm text-gray-600">後足角度</div>
              <input
                type="number"
                className="mt-1 w-full border rounded p-2"
                value={backAngle}
                onChange={(e) => setBackAngle(Number(e.target.value))}
              />
            </label>

            <label className="block">
              <div className="text-sm text-gray-600">ハイバック（0〜10）</div>
              <input
                type="number"
                min={0}
                max={10}
                className="mt-1 w-full border rounded p-2"
                value={highback}
                onChange={(e) => setHighback(Number(e.target.value))}
              />
            </label>
          </div>

          <label className="block">
            <div className="text-sm text-gray-600">メモ</div>
            <textarea
              className="mt-1 w-full border rounded p-2 min-h-[120px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <button
            onClick={save}
            disabled={saving}
            className="w-full border rounded p-2"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      )}
    </main>
  );
}

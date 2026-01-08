"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type TemplateRow = {
  id: string;
  name: string;
  front_angle: number;
  back_angle: number;
  highback: number;
};

export default function SnowboardNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // フォーム
  const [rideDate, setRideDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [resort, setResort] = useState("");
  const [snowQuality, setSnowQuality] = useState("packed");
  const [crowd, setCrowd] = useState(3);

  const [frontAngle, setFrontAngle] = useState(33);
  const [backAngle, setBackAngle] = useState(27);
  const [highback, setHighback] = useState(5);

  const [note, setNote] = useState("");

  // テンプレ
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [templateId, setTemplateId] = useState<string>("");

  const loadTemplates = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("snowboard_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    setTemplates((data ?? []) as TemplateRow[]);
  };

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!resort.trim()) {
      alert("ゲレンデ名を入力してね");
      return;
    }
    if (crowd < 1 || crowd > 5) {
      alert("混雑を選択してね");
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

    const { error } = await supabase.from("snowboard_logs").insert({
      user_id: user.id,
      ride_date: rideDate,
      resort: resort.trim(),
      snow_quality: snowQuality,
      crowd,
      front_angle: frontAngle,
      back_angle: backAngle,
      highback,
      note: note.trim() ? note.trim() : null,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/snowboard");
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">スノボログ 新規作成</h1>

      <div className="mt-4">
        <Link className="underline" href="/snowboard">
          ← 一覧へ戻る
        </Link>
      </div>

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
          <div className="text-sm text-gray-600">テンプレ</div>
          <select
            className="mt-1 w-full border rounded p-2"
            value={templateId}
            onChange={(e) => {
              const id = e.target.value;
              setTemplateId(id);

              const t = templates.find((x) => x.id === id);
              if (!t) return;

              setFrontAngle(t.front_angle);
              setBackAngle(t.back_angle);
              setHighback(t.highback);
            }}
          >
            <option value="">（選択なし）</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}（前{t.front_angle}/後{t.back_angle}/HB{t.highback}）
              </option>
            ))}
          </select>
        </label>

        <button
          className="w-full border rounded p-2"
          onClick={async () => {
            const name = prompt("テンプレ名（例：カービング用）");
            if (!name?.trim()) return;

            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
              alert("ログインしてから保存してね");
              return;
            }

            const { error } = await supabase.from("snowboard_templates").insert({
              user_id: user.id,
              name: name.trim(),
              front_angle: frontAngle,
              back_angle: backAngle,
              highback,
            });

            if (error) {
              alert(error.message);
              return;
            }

            await loadTemplates();
            alert("テンプレ保存した！");
          }}
        >
          今の角度でテンプレ保存
        </button>

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
    </main>
  );
}

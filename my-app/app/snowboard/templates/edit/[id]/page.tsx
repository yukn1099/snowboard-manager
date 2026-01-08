"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type TemplateRow = {
  id: string;
  user_id: string;
  name: string;
  front_angle: number;
  back_angle: number;
  highback: number;
};

export default function TemplateEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // フォーム
  const [name, setName] = useState("");
  const [frontAngle, setFrontAngle] = useState(33);
  const [backAngle, setBackAngle] = useState(27);
  const [highback, setHighback] = useState(5);

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
      .from("snowboard_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    const row = data as TemplateRow;

    setName(row.name);
    setFrontAngle(row.front_angle);
    setBackAngle(row.back_angle);
    setHighback(row.highback);

    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async () => {
    if (!name.trim()) {
      alert("テンプレ名を入力してね");
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
      .from("snowboard_templates")
      .update({
        name: name.trim(),
        front_angle: frontAngle,
        back_angle: backAngle,
        highback,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/snowboard/templates");
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">テンプレ編集</h1>

      <div className="mt-4 flex gap-3">
        <Link className="underline" href="/snowboard/templates">
          ← テンプレ一覧へ
        </Link>
        <Link className="underline" href="/snowboard/new">
          ← 新規ログへ
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-600">読み込み中...</p>
      ) : (
        <div className="mt-6 space-y-4">
          <label className="block">
            <div className="text-sm text-gray-600">テンプレ名</div>
            <input
              className="mt-1 w-full border rounded p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：カービング用"
            />
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

"use client";

import { useEffect, useState } from "react";

export default function AdminSermonPage() {
  const [channelId, setChannelId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      const map = (d.items || []).reduce((a: any, c: any) => ({ ...a, [c.key]: c.value }), {});
      setChannelId(map.youtube_channel_id || "");
      setApiKey(map.youtube_api_key || "");
    });
  }, []);

  async function save() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtube_channel_id: channelId, youtube_api_key: apiKey })
    });
    setLoading(false);
    if (res.ok) {
      setIsError(false);
      setMessage("저장되었습니다.");
    } else {
      setIsError(true);
      setMessage(res.status === 401 ? "세션이 만료되었습니다. 로그아웃 후 다시 로그인해주세요." : `저장 실패 (${res.status})`);
    }
  }

  async function test() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/sermon-test");
    const data = await res.json();
    setLoading(false);
    setIsError(!data.ok);
    setMessage(data.message || "실패");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">설교 영상 설정</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 max-w-2xl">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">YouTube Channel ID</label>
          <input
            className="admin-input"
            placeholder="UCxxxxxxxxxxxxxxxxxxxxxxxx"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">예: UCujiIR_4Ge6kqGApJGe5l0g (UC로 시작하는 채널 ID)</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">YouTube API Key</label>
          <input
            className="admin-input"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="admin-btn" onClick={save} disabled={loading}>
            {loading ? "처리 중..." : "저장"}
          </button>
          <button
            className="rounded-md bg-slate-100 px-4 py-2 text-sm disabled:opacity-50"
            onClick={test}
            disabled={loading}
          >
            최신 영상 불러오기 테스트
          </button>
        </div>
        {message && (
          <p className={`whitespace-pre-wrap text-sm ${isError ? "text-red-500" : "text-emerald-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

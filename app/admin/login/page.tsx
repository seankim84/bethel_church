"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@bethel.church");
  const [password, setPassword] = useState("bethel2026!");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    });
    if (res?.ok) router.push("/admin");
    else setError("로그인 실패");
  }

  return (
    <div className="container-page section-space max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-navy">관리자 로그인</h1>
      <form className="space-y-3 rounded-lg border border-slate-200 p-5" onSubmit={onSubmit}>
        <input className="admin-input" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="admin-input" type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button className="admin-btn w-full">로그인</button>
      </form>
      <p className="mt-3 text-xs text-slate-500">초기 비밀번호는 로그인 후 즉시 변경하세요.</p>
    </div>
  );
}

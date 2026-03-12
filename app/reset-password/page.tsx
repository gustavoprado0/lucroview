"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPassword() {
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");

  const handleReset = async () => {
    await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token,
        password,
      }),
    });
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <h1 className="text-xl font-bold">Nova senha</h1>

      <input
        type="password"
        className="border p-2 w-full"
        placeholder="Nova senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleReset}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Alterar senha
      </button>
    </div>
  );
}
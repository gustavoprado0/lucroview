"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    const result = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
  
    setLoading(false);
  
    if (result?.error) {
      setError("E-mail ou senha incorretos");
      return;
    }
  
    window.location.replace("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/lucroview.png" alt="LucroView" width={500} height={100} />
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-1">Bem-vindo de volta</h2>
          <p className="text-emerald-300 text-sm mb-6">Entre na sua conta para continuar</p>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="E-mail"
              className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-white/30"
              required
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Senha"
              className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-white/30"
              required
            />

            <Button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-emerald-500 text-white">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <Button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full py-3 mt-2 rounded-xl bg-white text-black"
          >
            Entrar com Google
          </Button>

          <p className="mt-4 text-center text-emerald-300">
            Não tem conta? <Link href="/register" className="text-emerald-400">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
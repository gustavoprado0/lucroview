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

            <Button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-900 text-white cursor-pointer">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <Button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full py-3 mt-2 rounded-xl bg-white hover:bg-gray-200 text-black flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Entrar com Google
          </Button>

          <div className="flex justify-between items-center">
            <p className="mt-4 text-center text-white">
              Não tem conta? <Link href="/register" className="text-emerald-400">Criar conta</Link>
            </p>
            <Link href="/forgot-password" className="mt-4 text-center text-emerald-300">Esqueceu sua senha? </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (form.password !== form.confirm) {
      setError("As senhas não coincidem.");
      return;
    }
  
    if (form.password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
  
    setLoading(true);
  
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setError(data.error || "Erro ao criar conta");
        setLoading(false);
        return;
      }
  
      await signIn("credentials", {
        redirect: true, 
        email: form.email,
        password: form.password,
        callbackUrl: "/dashboard", 
      });
  
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/lucroview.png" alt="LucroView" width={500} height={100} />
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-1">Criar sua conta</h2>
          <p className="text-emerald-300 text-sm mb-6">Comece a controlar suas finanças hoje</p>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nome completo"
              className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-white/30"
              required
            />
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
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Confirmar senha"
              className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-white/30"
              required
            />

            <Button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-emerald-500 text-white">
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <p className="mt-4 text-center text-emerald-300">
            Já tem uma conta? <Link href="/login" className="text-emerald-400">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
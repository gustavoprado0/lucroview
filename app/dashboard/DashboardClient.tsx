"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { CreditCard, DollarSign, Plus, TrendingDown, TrendingUp, X } from "lucide-react";

type Transaction = {
    id: string;
    type: string;
    amount: number;
    category: string;
    description?: string | null;
    date: string;
};

type User = {
    id: string;
    name: string;
    email: string;
};

type Props = {
    user: User;
    transactions: Transaction[];
};

const CATEGORIES = ["Alimentação", "Transporte", "Saúde", "Educação", "Lazer", "Moradia", "Salário", "Freelance", "Investimento", "Outros"];

export default function DashboardClient({ user, transactions: initial }: Props) {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>(initial);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        type: "expense",
        amount: "",
        category: "Outros",
        description: "",
        date: new Date().toISOString().split("T")[0],
    });

    const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const chartData = useMemo(() => {
        const months: Record<string, { month: string; Receitas: number; Despesas: number }> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
            months[key] = { month: label, Receitas: 0, Despesas: 0 };
        }
        transactions.forEach(tx => {
            const key = tx.date.slice(0, 7);
            if (months[key]) {
                if (tx.type === "income") months[key].Receitas += tx.amount;
                else months[key].Despesas += tx.amount;
            }
        });
        return Object.values(months);
    }, [transactions]);

    const categoryData = useMemo(() => {
        const map: Record<string, number> = {};
        transactions.filter(t => t.type === "expense").forEach(t => {
            map[t.category] = (map[t.category] || 0) + t.amount;
        });
        return Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [transactions]);

    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const handleLogout = () => {
        document.cookie = "token=; path=/; max-age=0";
        localStorage.removeItem("user");
        router.push("/login");
    };

    const handleSubmit = async () => {
        if (!form.amount || isNaN(Number(form.amount))) return;
        setLoading(true);
        try {
            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    amount: parseFloat(form.amount),
                    userId: user.id,
                }),
            });
            if (res.ok) {
                const created = await res.json();
                setTransactions(prev => [{ ...created, date: created.date, type: form.type }, ...prev]);
                setShowModal(false);
                setForm({ type: "expense", amount: "", category: "Outros", description: "", date: new Date().toISOString().split("T")[0] });
            }
        } finally {
            setLoading(false);
        }
    };

    const tooltipStyle = {
        backgroundColor: "#0f2918",
        border: "1px solid #166534",
        borderRadius: "12px",
        color: "#d1fae5",
    };

    return (
        <div className="w-full min-h-screen bg-gray-950 text-white">
            <nav className="border-b border-white/10 bg-gray-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
                <img src="/lucroview.png" alt="LucroView" className="h-8" />
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 hidden sm:block">Olá, <span className="text-emerald-400 font-medium">{user.name}</span></span>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-lg transition"
                    >
                        Sair
                    </button>
                </div>
            </nav>

            <div className="w-full px-4 sm:px-6 py-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-0.5">Visão geral das suas finanças</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Transação
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Saldo Atual", value: balance, color: balance >= 0 ? "text-emerald-400" : "text-red-400", bg: "from-emerald-500/10 to-transparent", icon: <DollarSign className="w-6 h-6" /> },
                        { label: "Total Receitas", value: totalIncome, color: "text-emerald-400", bg: "from-emerald-500/10 to-transparent", icon: <TrendingUp className="w-6 h-6" /> },
                        { label: "Total Despesas", value: totalExpense, color: "text-red-400", bg: "from-red-500/10 to-transparent", icon: <TrendingDown className="w-6 h-6" /> },
                    ].map(card => (
                        <div key={card.label} className={`bg-gradient-to-br ${card.bg} border border-white/10 rounded-2xl p-6`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-400 text-sm">{card.label}</span>
                                <span>{card.icon}</span>
                            </div>
                            <p className={`text-2xl font-bold ${card.color}`}>{fmt(card.value)}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-gray-900 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-base font-semibold mb-1">Receitas vs Despesas</h2>
                        <p className="text-gray-500 text-xs mb-6">Últimos 6 meses</p>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
                                <Area type="monotone" dataKey="Receitas" stroke="#10b981" strokeWidth={2} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="Despesas" stroke="#f43f5e" strokeWidth={2} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-base font-semibold mb-1">Despesas por Categoria</h2>
                        <p className="text-gray-500 text-xs mb-6">Top categorias</p>
                        {categoryData.length === 0 ? (
                            <div className="flex items-center justify-center h-52 text-gray-600 text-sm">Sem despesas ainda</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={categoryData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                                    <XAxis
                                        type="number"
                                        tick={{ fill: "#6b7280", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={80}
                                    />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="value" fill="#ef4444" radius={[0, 6, 6, 0]} name="Valor" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/10">
                        <h2 className="text-base font-semibold">Últimas Transações</h2>
                    </div>
                    {transactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-600">
                            <p className="text-4xl mb-3">📋</p>
                            <p>Nenhuma transação ainda. Crie a primeira!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wide">
                                        <th className="px-6 py-3 text-left">Data</th>
                                        <th className="px-6 py-3 text-left">Descrição</th>
                                        <th className="px-6 py-3 text-left">Categoria</th>
                                        <th className="px-6 py-3 text-left">Tipo</th>
                                        <th className="px-6 py-3 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.slice(0, 10).map((tx, i) => (
                                        <tr key={tx.id} className={`border-b border-white/5 hover:bg-white/5 transition ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                                            <td className="px-6 py-4 text-gray-400">{new Date(tx.date).toLocaleDateString("pt-BR")}</td>
                                            <td className="px-6 py-4 text-gray-200">{tx.description || "-"}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-white/10 text-gray-300 text-xs px-2.5 py-1 rounded-full">{tx.category}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${tx.type === "income" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                                    {tx.type === "income" ? "Receita" : "Despesa"}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-semibold ${tx.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                                                {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                            <h3 className="text-lg font-semibold">Nova Transação</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: "income", label: "Receita", icon: <DollarSign className="w-4 h-4" /> },
                                    { value: "expense", label: "Despesa", icon: <TrendingDown className="w-4 h-4" /> },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setForm(f => ({ ...f, type: opt.value }))}
                                        className={`py-2.5 rounded-xl text-sm font-medium transition border flex items-center justify-center gap-2 ${form.type === opt.value
                                            ? opt.value === "income"
                                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                                : "bg-red-500/20 border-red-500 text-red-400"
                                            : "border-white/10 text-gray-400 hover:border-white/30"
                                            }`}
                                    >
                                        {opt.icon}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">Valor (R$)</label>
                                <input
                                    type="number"
                                    placeholder="0,00"
                                    value={form.amount}
                                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">Categoria</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">Descrição (opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Aluguel de março"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">Data</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-white font-semibold transition text-sm flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Salvando...
                                    </>
                                ) : "Salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
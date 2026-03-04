"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { AlertCircle, Clipboard, DollarSign, Plus, TrendingDown, TrendingUp, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
const LOW_BALANCE_THRESHOLD = 500;
const PAGE_SIZE = 15;


export default function DashboardClient({ user, transactions: initial }: Props) {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>(initial);
    const [showModal, setShowModal] = useState(false);
    const [lowBalanceAlert, setLowBalanceAlert] = useState(false);
    const [importing, setImporting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
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
    const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
    const paginatedTransactions = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        const message = "⚠️ Atenção! Seu caixa está quase no fim. Considere entradas de receita em breve.";

        const checkAndCreateAlert = async () => {
            if (balance <= LOW_BALANCE_THRESHOLD) {
                setLowBalanceAlert(true);

                const res = await fetch(`/api/alerts?userId=${user.id}`);
                const data = await res.json();

                const exists = data.alerts?.some((a: any) => a.message === message && !a.read);

                if (!exists) {
                    await fetch("/api/alerts", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: user.id, message }),
                    });
                }
            } else {
                setLowBalanceAlert(false);
            }
        };

        checkAndCreateAlert();
    }, [balance, user.id]);

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

    const createAlert = (message: string) => {
        toast.warn(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
        });
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
                setPage(1);
                setShowModal(false);
                setForm({ type: "expense", amount: "", category: "Outros", description: "", date: new Date().toISOString().split("T")[0] });

                if (form.type === "expense" && parseFloat(form.amount) > 2000) {
                    createAlert(` Gasto alto detectado: ${fmt(parseFloat(form.amount))} em ${form.category}`);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const tooltipStyle = {
        backgroundColor: "#f9fafb",
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        color: "#111827",
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 text-gray-900">
            <ToastContainer />

            <nav className="border-b border-gray-300 bg-white sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
                <img src="/lucroview.png" alt="LucroView" className="h-8" />
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-700 hidden sm:block">Olá, <span className="text-green-600 font-medium">{user.name}</span></span>
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer text-sm text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-lg transition"
                    >
                        Sair
                    </button>
                </div>
            </nav>

            {lowBalanceAlert && (
                <div className="fixed top-16 left-0 right-0 bg-red-600 text-white text-center py-2 z-40 shadow-md">
                    <div className="flex items-center gap-3 text-center justify-center">
                        <AlertCircle /> Atenção! Seu caixa está quase no fim. Considere entradas de receita em breve.
                    </div>
                </div>
            )}



            <div className="w-full px-4 sm:px-6 py-8 space-y-8">
                <div className="w-fit mt-14">
                    <label className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm">
                        <Plus className="w-4 h-4" />
                        Importar CSV
                        <input
                            type="file"
                            accept=".csv,.ofx"
                            className="hidden"
                            onChange={async (e) => {
                                if (!e.target.files?.length) return;
                                const file = e.target.files[0];
                                const formData = new FormData();
                                formData.append("file", file);
                                formData.append("userId", user.id);

                                try {
                                    const res = await fetch("/api/transactions/import", { method: "POST", body: formData });
                                    const data = await res.json();
                                    if (res.ok) {
                                        toast.success(`${data.createdCount} transações importadas com sucesso!`);
                                        const fetched = await fetch(`/api/transactions?userId=${user.id}`);
                                        const updated = await fetched.json();
                                        setTransactions(updated.transactions || []);
                                        setPage(1); // volta pra primeira página após importar
                                    } else {
                                        toast.error(data.error || "Erro ao importar transações");
                                    }
                                } catch (err) {
                                    toast.error("Erro ao processar arquivo");
                                } finally {
                                    e.target.value = "";
                                }
                            }}
                        />
                    </label>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-gray-600 text-sm mt-0.5">Visão geral das suas finanças</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center cursor-pointer gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2.5 rounded-xl transition shadow-md text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Transação
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Saldo Atual", value: balance, color: balance >= 0 ? "text-green-600" : "text-red-600", bg: "from-green-100 to-transparent", icon: <DollarSign className="w-6 h-6" /> },
                        { label: "Total Receitas", value: totalIncome, color: "text-green-600", bg: "from-green-100 to-transparent", icon: <TrendingUp className="w-6 h-6" /> },
                        { label: "Total Despesas", value: totalExpense, color: "text-red-600", bg: "from-red-100 to-transparent", icon: <TrendingDown className="w-6 h-6" /> },
                    ].map(card => (
                        <div key={card.label} className={`bg-gradient-to-br ${card.bg} border border-gray-300 rounded-2xl p-6`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-600 text-sm text-[16px]">{card.label}</span>
                                <span>{card.icon}</span>
                            </div>
                            <p className={`text-2xl font-bold ${card.color}`}>{fmt(card.value)}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border border-gray-300 rounded-2xl p-6">
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
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend wrapperStyle={{ color: "#6b7280", fontSize: 12 }} />
                                <Area type="monotone" dataKey="Receitas" stroke="#10b981" strokeWidth={2} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="Despesas" stroke="#ef4444" strokeWidth={2} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-2xl p-6">
                        <h2 className="text-base font-semibold mb-1">Despesas por Categoria</h2>
                        <p className="text-gray-500 text-xs mb-6">Top categorias</p>
                        {categoryData.length === 0 ? (
                            <div className="flex items-center justify-center h-52 text-gray-500 text-sm">Sem despesas ainda</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={categoryData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="value" fill="#ef4444" radius={[0, 6, 6, 0]} name="Valor" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-300 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold">Transações</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{transactions.length} transações no total</p>
                        </div>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="flex flex-col gap-3 justify-center items-center text-center">
                                <Clipboard />
                                <p>Nenhuma transação ainda. Crie a primeira!</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-300 text-gray-500 text-xs uppercase tracking-wide">
                                            <th className="px-6 py-3 text-left">Data</th>
                                            <th className="px-6 py-3 text-left">Descrição</th>
                                            <th className="px-6 py-3 text-left">Categoria</th>
                                            <th className="px-6 py-3 text-left">Tipo</th>
                                            <th className="px-6 py-3 text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTransactions.map((tx, i) => (
                                            <tr key={tx.id} className={`border-b border-gray-200 hover:bg-gray-50 transition ${i % 2 === 0 ? "" : "bg-gray-100"}`}>
                                                <td className="px-6 py-4 text-gray-700">{new Date(tx.date).toLocaleDateString("pt-BR")}</td>
                                                <td className="px-6 py-4 text-gray-800">{tx.description || "-"}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-full">{tx.category}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${tx.type === "income" ? "bg-green-200 text-green-600" : "bg-red-200 text-red-600"}`}>
                                                        {tx.type === "income" ? "Receita" : "Despesa"}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-semibold ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                                                    {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Controles de paginação */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Página {page} de {totalPages} · {transactions.length} transações
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        {/* Números de página */}
                                        <div className="flex gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                                                    acc.push(p);
                                                    return acc;
                                                }, [])
                                                .map((p, idx) =>
                                                    p === "..." ? (
                                                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-gray-400">...</span>
                                                    ) : (
                                                        <button
                                                            key={p}
                                                            onClick={() => setPage(p as number)}
                                                            className={`w-7 h-7 text-xs rounded-lg transition ${page === p ? "bg-green-600 text-white font-semibold" : "border border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                                                        >
                                                            {p}
                                                        </button>
                                                    )
                                                )}
                                        </div>

                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-200/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-md shadow-md">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-300">
                            <h3 className="text-lg font-semibold text-gray-900">Nova Transação</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-900 transition">
                                <X className="w-5 h-5 cursor-pointer" />
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
                                        className={`py-2.5 cursor-pointer rounded-xl text-sm font-medium transition border flex items-center justify-center gap-2 ${form.type === opt.value
                                            ? opt.value === "income"
                                                ? "bg-green-100 border-green-400 text-green-600"
                                                : "bg-red-100 border-red-400 text-red-600"
                                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                                            }`}
                                    >
                                        {opt.icon}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 mb-1.5 block">Valor (R$)</label>
                                <input
                                    type="number"
                                    placeholder="0,00"
                                    value={form.amount}
                                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                    className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 mb-1.5 block">Categoria</label>
                                <div className="relative w-full">
                                    <select
                                        value={form.category}
                                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                        className="w-full cursor-pointer bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm appearance-none"
                                    >
                                        {CATEGORIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 mb-1.5 block">Descrição (opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Aluguel de março"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 mb-1.5 block">Data</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                    className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 cursor-pointer py-3 rounded-xl border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 transition text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 cursor-pointer py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-green-300 text-white font-semibold transition text-sm flex items-center justify-center gap-2"
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
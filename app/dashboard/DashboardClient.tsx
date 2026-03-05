"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { DollarSign, Plus, TrendingDown, TrendingUp, ChevronLeft, ChevronRight, CreditCard, Banknote, Landmark } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { FinancialInsights } from "@/components/FinancialInsights";

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
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageInput, setPageInput] = useState(page.toString());
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
        setPageInput(page.toString());
    }, [page]);

    const handlePageSubmit = () => {
        const pageNumber = Number(pageInput);

        if (isNaN(pageNumber)) {
            setPageInput(page.toString());
            return;
        }

        const validPage = Math.min(Math.max(1, pageNumber), totalPages);
        setPage(validPage);
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await fetch(`/api/transactions?userId=${user.id}`);
                const data = await res.json();
                if (data.transactions) setTransactions(data.transactions);
            } catch (err) {
                console.error("Erro ao atualizar transações:", err);
            }
        };

        fetchTransactions();

        const interval = setInterval(fetchTransactions, 5000);
        return () => clearInterval(interval);
    }, [user.id]);

    useEffect(() => {
        const message = "Seu caixa está quase no fim. Considere entradas de receita em breve.";

        const checkLowBalance = async () => {
            if (balance <= LOW_BALANCE_THRESHOLD) {

                if (!toast.isActive("low-balance")) {
                    toast.warning(message, {
                        toastId: "low-balance",
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "light",
                    });
                }

                const res = await fetch(`/api/alerts?userId=${user.id}`);
                const data = await res.json();

                const exists = data.alerts?.some(
                    (a: any) => a.message === message && !a.read
                );

                if (!exists) {
                    await fetch("/api/alerts", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: user.id, message }),
                    });
                }
            }
        };

        checkLowBalance();
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

    const incomeCategoryData = useMemo(() => {
        const map: Record<string, number> = {};

        transactions
            .filter(t => t.type === "income")
            .forEach(t => {
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
        <div className="w-full min-h-screen bg-green-50/20 text-gray-900">
            <ToastContainer />

            <nav className="border-b bg-background sticky top-0 z-40">
                <div className="w-full px-4 sm:px-6 py-4 flex items-center justify-between">

                    <Image
                        src="/lucroview.png"
                        alt="LucroView"
                        width={150}
                        height={100}
                    />

                    <div className="flex items-center gap-2 sm:gap-4">

                        <span className="hidden sm:block text-sm text-muted-foreground">
                            Olá,{" "}
                            <span className="text-green-600 font-medium">
                                {user.name}
                            </span>
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="px-3 sm:px-4"
                        >
                            Sair
                        </Button>
                    </div>
                </div>
            </nav>


            <div className="w-full px-4 sm:px-6 pb-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="mt-5">
                        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
                        <p className="text-gray-600 text-sm mt-0.5">Visão geral das suas finanças</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setShowModal(true)}
                            className="flex items-center cursor-pointer gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition shadow-md text-xs sm:text-sm whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden xs:inline">Nova </span>Transação
                        </Button>

                        <label className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2 sm:py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap">
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
                                            setPage(1);
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    <div className="bg-[#f3f4f6] rounded-3xl shadow-md px-6 py-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Saldo atual</p>
                            <h3 className="text-2xl font-semibold text-gray-800">
                                {fmt(balance)}
                            </h3>
                        </div>

                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                            <Landmark className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <div className="bg-[#f3f4f6] rounded-3xl shadow-md px-6 py-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Receitas</p>
                            <h3 className="text-2xl font-semibold text-gray-800">
                                {fmt(totalIncome)}
                            </h3>
                        </div>

                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <div className="bg-[#f3f4f6] rounded-3xl shadow-md px-6 py-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Despesas</p>
                            <h3 className="text-2xl font-semibold text-gray-800">
                                {fmt(totalExpense)}
                            </h3>
                        </div>

                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {/* CARTÃO */}
                    {/* <div className="bg-[#f3f4f6] rounded-3xl shadow-md px-6 py-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Cartão de crédito</p>
                            <h3 className="text-2xl font-semibold text-gray-800">
                                R$ 0,00
                            </h3>
                        </div>

                        <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                    </div> */}

                </div>

                <FinancialInsights />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Receitas vs Despesas</CardTitle>
                            <CardDescription>Últimos 6 meses</CardDescription>
                        </CardHeader>

                        <CardContent className="pt-0">
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

                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                                        width={48}
                                    />

                                    <Tooltip contentStyle={tooltipStyle} />

                                    <Legend wrapperStyle={{ fontSize: 12 }} />

                                    <Area
                                        type="monotone"
                                        dataKey="Receitas"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fill="url(#colorIncome)"
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="Despesas"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        fill="url(#colorExpense)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>


                    <Card>
                        <CardHeader>
                            <CardTitle>Despesas por Categoria</CardTitle>
                            <CardDescription>Top categorias</CardDescription>
                        </CardHeader>

                        <CardContent className="pt-0">
                            {categoryData.length === 0 ? (
                                <div className="flex items-center justify-center h-56 text-sm text-muted-foreground">
                                    Sem despesas ainda
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={categoryData} layout="vertical">
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                            className="stroke-muted"
                                        />

                                        <XAxis
                                            type="number"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11 }}
                                            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11 }}
                                            width={80}
                                        />

                                        <Tooltip contentStyle={tooltipStyle} />

                                        <Bar
                                            dataKey="value"
                                            fill="#ef4444"
                                            radius={[0, 8, 8, 0]}
                                            name="Valor"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Receitas por Categoria</CardTitle>
                            <CardDescription>Top categorias</CardDescription>
                        </CardHeader>

                        <CardContent className="pt-0">
                            {incomeCategoryData.length === 0 ? (
                                <div className="flex items-center justify-center h-56 text-sm text-muted-foreground">
                                    Sem receitas ainda
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={incomeCategoryData} layout="vertical">
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                            className="stroke-muted"
                                        />

                                        <XAxis
                                            type="number"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11 }}
                                            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11 }}
                                            width={80}
                                        />

                                        <Tooltip contentStyle={tooltipStyle} />

                                        <Bar
                                            dataKey="value"
                                            fill="#10b981"
                                            radius={[0, 8, 8, 0]}
                                            name="Valor"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>


                <Card>
                    <CardHeader>
                        <CardTitle>Transações</CardTitle>
                        <CardDescription>
                            {transactions.length} transações no total
                        </CardDescription>
                    </CardHeader>

                    <CardContent>

                        <div className="w-full overflow-x-auto">
                            <Table className="min-w-[700px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Categoria</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {paginatedTransactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell>
                                                {new Date(tx.date).toLocaleDateString("pt-BR")}
                                            </TableCell>

                                            <TableCell>{tx.description || "-"}</TableCell>

                                            <TableCell>
                                                <Badge variant="secondary">{tx.category}</Badge>
                                            </TableCell>

                                            <TableCell>
                                                <Badge variant={tx.type === "income" ? "default" : "destructive"}>
                                                    {tx.type === "income" ? "Receita" : "Despesa"}
                                                </Badge>
                                            </TableCell>

                                            <TableCell
                                                className={`text-right font-semibold ${tx.type === "income" ? "text-green-600" : "text-red-600"
                                                    }`}
                                            >
                                                {tx.type === "income" ? "+" : "-"}
                                                {fmt(tx.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>


                            </Table>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">

                                <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                                    Página {page} de {totalPages}
                                </p>

                                <div className="flex items-center gap-2 flex-wrap justify-center">

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={page === 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        className="h-8 w-8 sm:h-9 sm:w-9"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>

                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                        <span>Ir para</span>

                                        <Input
                                            type="number"
                                            min={1}
                                            max={totalPages}
                                            value={pageInput}
                                            onChange={(e) => setPageInput(e.target.value)}
                                            onBlur={handlePageSubmit}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handlePageSubmit();
                                                }
                                            }}
                                            className="w-16 h-8 text-center px-1"
                                        />

                                        <span>de {totalPages}</span>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={page === totalPages}
                                        onClick={() =>
                                            setPage((p) => Math.min(totalPages, p + 1))
                                        }
                                        className="h-8 w-8 sm:h-9 sm:w-9"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>

                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {showModal && (
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nova Transação</DialogTitle>
                        </DialogHeader>

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

                        <div className="space-y-4">
                            <Input
                                type="number"
                                placeholder="Valor"
                                value={form.amount}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, amount: e.target.value }))
                                }
                            />
                            <Select
                                value={form.category}
                                onValueChange={(value) =>
                                    setForm((f) => ({ ...f, category: value }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Categoria" />
                                </SelectTrigger>

                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Descrição"
                                value={form.description}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, description: e.target.value }))
                                }
                            />

                            <Input
                                type="date"
                                value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowModal(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? "Salvando..." : "Salvar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
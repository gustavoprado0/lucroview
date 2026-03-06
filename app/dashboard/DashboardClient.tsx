"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { NavbarDashboard } from "@/components/NavbarDashboard";
import { SummaryCards } from "@/components/SummaryCards";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { ExpenseCategoryChart } from "@/components/charts/ExpenseCategoryChart";
import { IncomeCategoryChart } from "@/components/charts/IncomeCategoryChart";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import CreateTransactionModal from "@/components/transactions/TransactionModal";
import ForecastCard from "@/components/ForecastCard";
import ImportTransactionsButton from "@/components/transactions/ImportTransactionsButton";
import { FinancialInsights } from "@/components/financial-insights/FinancialInsights";
import EmptyDashboard from "@/components/EmptyDashboard";
import { Transaction, TransactionForm } from "@/types/transaction";

type User = {
    id: string;
    name: string;
    email: string;
};

type Props = {
    user: User;
    transactions: Transaction[];
};

const CATEGORIES = ["Alimentação", "Transporte", "Saúde", "Educação", "Lazer", "Moradia", "Salário", "Freelance", "Investimento", "Vendas", "Outros"];
const LOW_BALANCE_THRESHOLD = 500;
const PAGE_SIZE = 15;

export default function DashboardClient({ user, transactions: initial }: Props) {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>(initial || []);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageInput, setPageInput] = useState(page.toString());
    const [form, setForm] = useState<TransactionForm>({
        type: "income",
        amount: "",
        category: "",
        description: "",
        date: "",
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
                if (data.transactions) {
                    const normalized: Transaction[] = data.transactions.map((t: any) => ({
                        ...t,
                        type: t.type as "income" | "expense",
                    }));

                    setTransactions(normalized);
                }
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
                    (a: { message: string; read: boolean }) => a.message === message && !a.read
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
            const dateStr =
                typeof tx.date === "string"
                    ? tx.date
                    : tx.date.toISOString();

            const key = dateStr.slice(0, 7);
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

    const handleSubmit = async () => {
        if (!form.amount || isNaN(Number(form.amount))) return;

        setLoading(true);

        try {
            const payload = {
                ...form,
                amount: parseFloat(form.amount),
                userId: user.id,
            };

            const res = await fetch("/api/transactions", {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    editingId ? { ...payload, id: editingId } : payload
                ),
            });

            if (res.ok) {
                const data = await res.json();

                if (editingId) {
                    setTransactions(prev =>
                        prev.map(t => (t.id === editingId ? data : t))
                    );
                } else {
                    setTransactions(prev => [data, ...prev]);
                }

                setEditingId(null);
                setShowModal(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm("Deseja deletar esta transação?");
        if (!confirmDelete) return;

        const res = await fetch(`/api/transactions?id=${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            setTransactions(prev => prev.filter(t => t.id !== id));
            toast.success("Transação removida");
        }
    };

    const handleEdit = (tx: Transaction) => {
        setEditingId(tx.id);

        setForm({
            type: tx.type,
            amount: tx.amount.toString(),
            category: tx.category,
            description: tx.description || "",
            date: new Date(tx.date).toISOString().split("T")[0],
        });

        setShowModal(true);
    };

    const forecast = useMemo(() => {
        if (chartData.length < 2) return null;

        const avgIncome =
            chartData.reduce((sum, m) => sum + m.Receitas, 0) / chartData.length;

        const avgExpense =
            chartData.reduce((sum, m) => sum + m.Despesas, 0) / chartData.length;

        const nextBalance = balance + avgIncome - avgExpense;

        return {
            avgIncome,
            avgExpense,
            nextBalance,
        };
    }, [chartData, balance]);

    const tooltipStyle = {
        backgroundColor: "#f9fafb",
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        color: "#111827",
    };

    const hasData = transactions.length > 0;

    return (
        <div className="w-full min-h-screen bg-green-50/20 text-gray-900">
            <ToastContainer />

            <NavbarDashboard
                userName={user.name}
                onLogout={handleLogout}
            />

            <div className="w-full px-4 sm:px-6 pb-8 space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5">

                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold">
                            Dashboard
                        </h1>

                        <p className="text-gray-600 text-sm mt-0.5">
                            Visão geral das suas finanças
                        </p>
                    </div>

                    <div className="flex items-center gap-3">

                        <Button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-3 sm:px-4 py-2 rounded-xl transition shadow-md text-xs sm:text-sm cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Transação
                        </Button>

                        <ImportTransactionsButton
                            userId={user.id}
                            setTransactions={setTransactions}
                            setPage={setPage}
                        />

                    </div>
                </div>

                {!hasData ? (
                    <EmptyDashboard onCreate={() => setShowModal(true)} />
                ) : (
                    <>

                        <SummaryCards
                            balance={balance}
                            totalIncome={totalIncome}
                            totalExpense={totalExpense}
                            fmt={fmt}
                        />

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <FinancialInsights
                                balance={balance}
                                totalIncome={totalIncome}
                                totalExpense={totalExpense}
                                fmt={fmt}
                            />

                            <ForecastCard
                                forecast={forecast}
                                fmt={fmt}
                            />

                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

                            <IncomeExpenseChart
                                chartData={chartData}
                                tooltipStyle={tooltipStyle}
                            />

                            <ExpenseCategoryChart
                                categoryData={categoryData}
                                tooltipStyle={tooltipStyle}
                            />

                            <IncomeCategoryChart
                                incomeCategoryData={incomeCategoryData}
                                tooltipStyle={tooltipStyle}
                            />

                        </div>

                        <TransactionsTable
                            transactions={transactions}
                            paginatedTransactions={paginatedTransactions}
                            page={page}
                            totalPages={totalPages}
                            pageInput={pageInput}
                            setPageInput={setPageInput}
                            setPage={setPage}
                            handlePageSubmit={handlePageSubmit}
                            fmt={fmt}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />

                    </>
                )}
            </div>

            <CreateTransactionModal
                open={showModal}
                setOpen={setShowModal}
                form={form}
                setForm={setForm}
                loading={loading}
                handleSubmit={handleSubmit}
                categories={CATEGORIES}
            />
        </div>
    );
}
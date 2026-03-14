"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { NavbarDashboard } from "@/components/ui/navbar";
import { SummaryCards } from "@/components/SummaryCards";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { ExpenseCategoryChart } from "@/components/charts/ExpenseCategoryChart";
import { IncomeCategoryChart } from "@/components/charts/IncomeCategoryChart";
import ForecastCard from "@/components/ForecastCard";
import { FinancialInsights } from "@/components/financial-insights/FinancialInsights";
import EmptyDashboard from "@/components/EmptyDashboard";

import CreateTransactionModal from "@/components/transactions/TransactionModal";

import { Transaction, TransactionForm } from "@/types/transaction";
import SubscribeButton from "@/components/SubscribeButton";

type User = {
    id: string;
    name: string;
    email: string;
    image?: string | null;
};

type Props = {
    user: User;
    transactions: Transaction[];
};

const EXPENSE_CATEGORIES = [
    "Alimentação",
    "Transporte",
    "Saúde",
    "Educação",
    "Lazer",
    "Moradia",
    "Outros",
];

const INCOME_CATEGORIES = [
    "Salário",
    "Freelance",
    "Investimento",
    "Vendas",
    "Outros",
];

export default function DashboardClient({ user, transactions: initial }: Props) {

    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>(initial || []);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [pollingPaused, setPollingPaused] = useState(false);

    const initialForm: TransactionForm = {
        type: "income",
        amount: "",
        category: "",
        description: "",
        date: "",
    };

    const [form, setForm] = useState<TransactionForm>(initialForm);

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setForm(initialForm);
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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    editingId ? { ...payload, id: editingId } : payload
                ),
            });

            if (res.ok) {
                const data = await res.json();

                if (editingId) {
                    setTransactions((prev) =>
                        prev.map((t) => (t.id === editingId ? data : t))
                    );
                } else {
                    setTransactions((prev) => [data, ...prev]);
                }

                handleCloseModal();
            }

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        const fetchTransactions = async () => {

            if (pollingPaused) return;

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

    }, [user.id, pollingPaused]);

    const now = new Date();

    const currentMonthTransactions = useMemo(() => {

        return transactions.filter((t) => {

            const d = new Date(t.date);

            return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
            );
        });

    }, [transactions]);

    const totalIncome = currentMonthTransactions
        .filter(t => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);

    const totalExpense = currentMonthTransactions
        .filter(t => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);

    const balance = totalIncome - totalExpense;

    const chartData = useMemo(() => {

        const months: Record<string, { month: string; Receitas: number; Despesas: number }> = {};

        const now = new Date();

        for (let i = 5; i >= 0; i--) {

            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

            const label = d.toLocaleDateString("pt-BR", {
                month: "short",
                year: "2-digit",
            });

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

        transactions
            .filter(t => t.type === "expense")
            .forEach(t => {
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

    const fmt = (v: number) =>
        v.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });

    const handleLogout = () => {

        document.cookie = "token=; path=/; max-age=0";
        localStorage.removeItem("user");

        router.push("/login");
    };

    const hasData = transactions.length > 0;

    const tooltipStyle = {
        backgroundColor: "#f9fafb",
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        color: "#111827",
    };

    return (

        <div className="w-full min-h-screen bg-green-50/20 text-gray-900">

            <ToastContainer />

            <div className="w-full px-4 sm:px-6 pb-8 space-y-6">
                <div className="mt-5">
                    <h1 className="text-xl sm:text-2xl font-bold">
                        Dashboard
                    </h1>

                    <p className="text-gray-600 text-sm mt-0.5">
                        Visão geral das suas finanças
                    </p>

                    {/* <SubscribeButton
                        priceId="price_1TAhngQ03zJblkH6RG9GlKI8"
                        label="Assinar Mensal"
                        email={user.email ?? ''}
                    /> */}

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

                        <FinancialInsights
                            balance={balance}
                            totalIncome={totalIncome}
                            totalExpense={totalExpense}
                            fmt={fmt}
                        />

                        <ForecastCard forecast={forecast} fmt={fmt} />

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

                    </>

                )}

                <CreateTransactionModal
                    open={showModal}
                    setOpen={handleCloseModal}
                    form={form}
                    setForm={setForm}
                    loading={loading}
                    handleSubmit={handleSubmit}
                    categories={
                        form.type === "income"
                            ? INCOME_CATEGORIES
                            : EXPENSE_CATEGORIES
                    }
                />

            </div>

        </div>
    );
}
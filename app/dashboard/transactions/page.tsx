"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import CreateTransactionModal from "@/components/transactions/TransactionModal";
import ImportTransactionsButton from "@/components/transactions/ImportTransactionsButton";

import { Transaction, TransactionForm } from "@/types/transaction";

const PAGE_SIZE = 15;

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

export default function TransactionsPage() {

  const { data: session } = useSession();
  const user = session?.user;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(page.toString());

  const [pollingPaused, setPollingPaused] = useState(false);

  const initialForm: TransactionForm = {
    type: "income",
    amount: "",
    category: "",
    description: "",
    date: "",
  };

  const [form, setForm] = useState<TransactionForm>(initialForm);

  useEffect(() => {
    if (!user?.id) return;

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
        console.error("Erro ao buscar transações", err);
      }
    };

    fetchTransactions();

    const interval = setInterval(fetchTransactions, 5000);

    return () => clearInterval(interval);

  }, [user?.id, pollingPaused]);

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));

  const paginatedTransactions = transactions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const handlePageSubmit = () => {
    const pageNumber = Number(pageInput);

    if (isNaN(pageNumber)) {
      setPageInput(page.toString());
      return;
    }

    const validPage = Math.min(Math.max(1, pageNumber), totalPages);

    setPage(validPage);
  };

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
        userId: user?.id,
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

        setEditingId(null);
        setShowModal(false);
        setForm(initialForm);
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
      setTransactions((prev) => prev.filter((t) => t.id !== id));
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

  if (!user) return null;

  return (
    <div className="w-full px-6 py-6 space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Transações
          </h1>

          <p className="text-gray-500 text-sm">
            Gerencie suas receitas e despesas
          </p>
        </div>

        <div className="flex gap-3">

          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Transação
          </Button>

          <ImportTransactionsButton
            userId={user.id}
            setTransactions={setTransactions}
            setPage={setPage}
            setPollingPaused={setPollingPaused}
          />

        </div>
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
  );
}
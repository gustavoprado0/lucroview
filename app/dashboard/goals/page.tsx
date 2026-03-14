"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

dayjs.locale("pt-br");

type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline?: string | null;
};

function formatDate(date?: string | null) {
  if (!date) return null;

  const d = dayjs(date);

  if (!d.isValid()) return null;

  return d.format("DD/MM/YYYY");
}

function formatPretty(date?: string | null) {
  if (!date) return null;

  const d = dayjs(date);

  if (!d.isValid()) return null;

  return d.format("D [de] MMMM [de] YYYY");
}

function stringToDate(date?: string | null) {
  if (!date) return undefined;

  const d = dayjs(date);

  if (!d.isValid()) return undefined;

  return d.toDate();
}

export default function GoalsPage() {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [editSaved, setEditSaved] = useState("");
  const [editingSavedGoal, setEditingSavedGoal] = useState<string | null>(null);

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [goals, setGoals] = useState<Goal[]>([]);

  const fetchGoals = async () => {
    if (!userId) return;

    const res = await fetch(`/api/goals?userId=${userId}`);
    const data = await res.json();

    setGoals(data.goals || []);
  };

  useEffect(() => {
    if (userId) fetchGoals();
  }, [userId]);

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const createOrEditGoal = async () => {
    if (!name || !target || !userId) return;

    const method = selectedGoal ? "PUT" : "POST";
    const url = selectedGoal ? `/api/goals/${selectedGoal}` : `/api/goals`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        target,
        deadline,
        userId,
      }),
    });

    setName("");
    setTarget("");
    setDeadline("");
    setSelectedGoal(null);

    await fetchGoals();
    await fetch("/api/revalidate-transactions", { method: "POST" });
  };

  const addMoney = async () => {
    if (!selectedGoal || !amount) return;

    await fetch("/api/goals/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId: selectedGoal,
        userId,
        amount: Number(amount),
      }),
    });

    setAmount("");
    setSelectedGoal(null);

    await fetchGoals();
    await fetch("/api/revalidate-transactions", { method: "POST" });
  };

  const updateSaved = async () => {
    if (!editingSavedGoal || !editSaved) return;
  
    await fetch(`/api/goals/${editingSavedGoal}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        saved: Number(editSaved),
      }),
    });
  
    setEditSaved("");
    setEditingSavedGoal(null);
  
    await fetchGoals();
    await fetch("/api/revalidate-transactions", { method: "POST" });
  };

  const deleteGoal = async (goalId: string) => {
    const confirm = window.confirm(
      "Tem certeza que deseja deletar este objetivo?"
    );

    if (!confirm) return;

    await fetch(`/api/goals/${goalId}`, {
      method: "DELETE",
    });

    await fetchGoals();
    await fetch("/api/revalidate-transactions", { method: "POST" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Objetivos Financeiros</h1>
        <p className="text-gray-500 text-sm">
          Defina um nome, valor alvo e prazo para seu objetivo financeiro.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Criar objetivo</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Input
            placeholder="Nome do objetivo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Valor alvo"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />

                {deadline
                  ? formatPretty(deadline)
                  : "Selecionar data"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={stringToDate(deadline)}
                onSelect={(date) => {
                  if (!date) return;

                  const formatted = dayjs(date).format("YYYY-MM-DD");
                  setDeadline(formatted);
                }}
              />
            </PopoverContent>
          </Popover>

          <Button
            className="bg-green-600 hover:bg-green-700 cursor-pointer"
            onClick={createOrEditGoal}
          >
            {selectedGoal ? "Salvar alterações" : "Criar objetivo"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <div className="w-full flex justify-center items-center py-10 text-gray-500">
            Nenhum objetivo financeiro cadastrado.
          </div>
        ) : (
          goals.map((goal) => {
            const progress = goal.target
              ? (goal.saved / goal.target) * 100
              : 0;

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {goal.name}
                    </CardTitle>

                    <span className="text-sm text-gray-500">
                      {formatDate(goal.deadline) ?? "Sem prazo"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-500">
                    {fmt(goal.saved)} de {fmt(goal.target)}
                  </div>

                  <Progress value={progress} />

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
                          onClick={() => setSelectedGoal(goal.id)}
                        >
                          Guardar dinheiro
                        </Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Guardar para {goal.name}
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                          <Input
                            type="number"
                            placeholder="Valor"
                            value={amount}
                            onChange={(e) =>
                              setAmount(e.target.value)
                            }
                          />

                          <Button
                            className="w-full cursor-pointer bg-green-600 hover:bg-green-700"
                            onClick={addMoney}
                          >
                            Confirmar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={editingSavedGoal === goal.id} onOpenChange={() => setEditingSavedGoal(null)}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar valor guardado</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                          <Input
                            type="number"
                            placeholder="Novo valor"
                            value={editSaved}
                            onChange={(e) => setEditSaved(e.target.value)}
                          />

                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 cursor-pointer"
                            onClick={updateSaved}
                          >
                            Atualizar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                      onClick={() => {
                        setName(goal.name);
                        setTarget(goal.target.toString());
                        setDeadline(goal.deadline || "");
                        setSelectedGoal(goal.id);
                      }}
                    >
                      Editar
                    </Button>

                    <Button
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
                      onClick={() => {
                        setEditSaved(goal.saved.toString());
                        setEditingSavedGoal(goal.id);
                      }}
                    >
                      Editar valor
                    </Button>

                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

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
import { useSession } from "next-auth/react";

type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline?: string | null;
};

export default function GoalsPage() {

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
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

  const createGoal = async () => {

    if (!name || !target || !userId) return;

    const res = await fetch("/api/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        name,
        target,
        deadline,
      }),
    });

    const data = await res.json();

    console.log("Goal criada:", data);

    setName("");
    setTarget("");
    setDeadline("");

    fetchGoals();
  };

  const addMoney = async () => {

    if (!selectedGoal || !amount) return;

    await fetch("/api/goals/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goalId: selectedGoal,
        userId,
        amount: Number(amount),
      }),
    });

    setAmount("");
    setSelectedGoal(null);

    fetchGoals();
  };

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div className=" p-6 space-y-6">

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">
          Objetivos Financeiros
        </h1>

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

          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <Button onClick={createGoal}>
            Criar objetivo
          </Button>
        </CardContent>

      </Card>
      <div className="grid md:grid-cols-2 gap-4">

        {goals.map((goal) => {

          const progress = goal.target ? (goal.saved / goal.target) * 100 : 0;

          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {goal.name}
                  </CardTitle>
                  <span className="text-sm text-gray-500">
                    {goal.deadline
                      ? new Date(goal.deadline).toLocaleDateString()
                      : "Sem prazo"}

                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm text-gray-500">
                  {fmt(goal.saved)} de {fmt(goal.target)}
                </div>
                <Progress value={progress} />

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
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
                        onChange={(e) => setAmount(e.target.value)}
                      />

                      <Button
                        className="w-full"
                        onClick={addMoney}
                      >
                        Confirmar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
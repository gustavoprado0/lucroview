"use client";

import { useEffect, useState } from "react";
import CreateGoalModal from "./CreateGoalModal";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

type Goal = {
    id: string;
    name: string;
    target: number;
    saved: number;
};

export default function FinancialGoalsCard({ userId }: { userId: string }) {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [amount, setAmount] = useState("");

    const fetchGoals = async () => {
        const res = await fetch(`/api/goals?userId=${userId}`);
        const data = await res.json();
        setGoals(data.goals || []);
    };

    useEffect(() => {
        fetchGoals();
    }, [userId]);

    const handleAddMoney = async () => {
        if (!selectedGoal) return;
    
        const value = Number(amount);
    
        if (!value || value <= 0) return;
    
        const res = await fetch("/api/goals/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                goalId: selectedGoal,
                userId,
                amount: value
            })
        });
    
        const data = await res.json();
    
        console.log(data); // debug
    
        setAmount("");
        setSelectedGoal(null);
        setAddOpen(false);
    
        fetchGoals();
    };

    return (
        <Card className="bg-white rounded-xl shadow p-4">
            <CardTitle className="font-semibold mb-3">🎯 Objetivos Financeiros</CardTitle>
            <CardContent>

                {goals.length === 0 && (
                    <p className="text-sm text-gray-500">
                        Crie seu primeiro objetivo financeiro.
                    </p>
                )}
                <button
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-500"
                    onClick={() => setCreateOpen(true)}
                >
                    + Novo
                </button>

                {goals.map((goal) => {
                    const percent = (goal.saved / goal.target) * 100;

                    return (
                        <div key={goal.id} className="mb-4">

                            <div className="flex justify-between text-sm">
                                <span>{goal.name}</span>
                                <span>{percent.toFixed(0)}%</span>
                            </div>

                            <div className="w-full bg-gray-200 h-2 rounded mt-1">
                                <div
                                    className="bg-green-500 h-2 rounded"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                                R$ {goal.saved} / R$ {goal.target}
                            </p>

                            <Button
                                size="sm"
                                className="mt-2 bg-green-600 hover:bg-green-500"
                                onClick={() => {
                                    setSelectedGoal(goal.id);
                                    setAddOpen(true);
                                }}
                            >
                                Adicionar valor
                            </Button>

                        </div>
                    );
                })}

                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogContent>

                        <DialogHeader>
                            <DialogTitle>Guardar dinheiro no objetivo</DialogTitle>
                        </DialogHeader>

                        <div className="py-2">
                            <Input
                                type="number"
                                placeholder="Valor"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <DialogFooter>

                            <Button
                                variant="outline"
                                onClick={() => setAddOpen(false)}
                            >
                                Cancelar
                            </Button>

                            <Button
                                className="bg-green-600 hover:bg-green-500"
                                onClick={handleAddMoney}
                            >
                                Confirmar
                            </Button>

                        </DialogFooter>

                    </DialogContent>
                </Dialog>
                <CreateGoalModal
                    userId={userId}
                    open={createOpen}
                    setOpen={setCreateOpen}
                    onCreated={fetchGoals}
                />
            </CardContent>
        </Card>
    );
}
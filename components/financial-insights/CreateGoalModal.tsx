"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type Props = {
  userId: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  onCreated: () => void;
};

export default function CreateGoalModal({ userId, open, setOpen, onCreated }: Props) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const handleCreate = async () => {
    await fetch("/api/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        name,
        target: Number(target),
      }),
    });

    setName("");
    setTarget("");
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>

        <DialogHeader>
          <DialogTitle>Novo Objetivo</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">

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

        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>

          <Button
            className="bg-green-600 hover:bg-green-500"
            onClick={handleCreate}
          >
            Criar
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
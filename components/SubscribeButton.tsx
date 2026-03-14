"use client";
import React from "react";
import { Button } from "./ui/button";

interface SubscribeButtonProps {
  priceId: string;
  label: string;
  email: string;
}

export default function SubscribeButton({ priceId, label, email }: SubscribeButtonProps) {
  async function handleSubscribe() {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, email }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erro ao iniciar pagamento");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao iniciar pagamento");
    }
  }

  return (
    <Button
      onClick={handleSubscribe}
      className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 w-full sm:w-auto border border-green-700 mt-4"
    >
      {label}
    </Button>
  );
}
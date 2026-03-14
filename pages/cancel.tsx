"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Cancel() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard"); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center mt-10 space-y-4">
      <h1 className="text-center text-xl font-bold">
        Pagamento cancelado. 😔
      </h1>
      <p className="text-gray-600">
        Você será redirecionado para o Dashboard em breve.
      </p>
      <Button
        onClick={() => router.push("/dashboard")}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Voltar ao Dashboard
      </Button>
    </div>
  );
}
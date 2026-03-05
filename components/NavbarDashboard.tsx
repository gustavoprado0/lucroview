"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

type Props = {
  userName: string;
  onLogout: () => void;
};

export function NavbarDashboard({ userName, onLogout }: Props) {
  return (
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
              {userName}
            </span>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="px-3 sm:px-4"
          >
            Sair
          </Button>

        </div>
      </div>
    </nav>
  );
}
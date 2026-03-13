"use client";

import Image from "next/image";
import { Menu } from "lucide-react";

type Props = {
  onMenuToggle?: () => void;
};

export function NavbarDashboard({ onMenuToggle }: Props) {
  return (
    <nav className="border-b bg-background sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 py-4 flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Image
          src="/lucroview.png"
          alt="LucroView"
          width={150}
          height={100}
        />
      </div>
    </nav>
  );
}
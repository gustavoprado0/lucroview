"use client"

import { useState } from "react"
import Sidebar from "@/components/ui/sidebar"
import { NavbarDashboard } from "@/components/ui/navbar"
import { useSession, signOut } from "next-auth/react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <NavbarDashboard
        onMenuToggle={() => setIsOpen(prev => !prev)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          userName={session?.user?.name ?? ""}
          userImage={session?.user?.image}
          onLogout={() => signOut()}
        />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
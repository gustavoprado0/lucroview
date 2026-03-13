"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Lightbulb,
  LogOut,
} from "lucide-react"

const items = [
  { title: "Dashboard",  href: "/dashboard",              icon: LayoutDashboard },
  { title: "Transações", href: "/dashboard/transactions", icon: ArrowLeftRight  },
  // { title: "Insights",   href: "/dashboard/insights",     icon: Lightbulb       },
  { title: "Metas",      href: "/dashboard/goals",        icon: Target          },
]

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  userName?: string
  userImage?: string | null
  onLogout?: () => void
}

export default function Sidebar({ isOpen, setIsOpen, userName, userImage, onLogout }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      <aside
        className={`
          fixed top-[73px] left-0 bottom-0 z-30 w-64 bg-white border-r flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:top-0 md:translate-x-0 md:h-full md:shrink-0
        `}
      >
        <div className="px-6 pt-6 pb-2 hidden md:block">
          <h1 className="text-xl font-bold">LucroView</h1>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${active
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="px-6 py-4 border-t flex items-center gap-3">
          {userImage && (
            <Image
              src={userImage}
              alt={userName ?? ""}
              width={36}
              height={36}
              className="rounded-full object-cover ring-2 ring-green-500 shrink-0"
            />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">Minha conta</p>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-red-500"
            title="Sair"
          >
            <LogOut className="w-4 h-4 cursor-pointer" />
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed top-[73px] left-0 right-0 bottom-0 z-20 bg-black/30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
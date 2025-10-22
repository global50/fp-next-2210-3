'use client'

import { usePathname, useRouter } from "next/navigation"
import { Home, MessageSquare, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MessageSquare, label: "Chats", path: "/chats" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background">
      <div className="flex justify-around p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => router.push(item.path)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}

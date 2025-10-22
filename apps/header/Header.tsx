'use client'

import { useAuthContext } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function Header() {
  const { user, profile } = useAuthContext()
  const router = useRouter()

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold cursor-pointer" onClick={() => router.push('/')}>
            Business Network
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user && profile ? (
            <Button variant="ghost" onClick={() => router.push('/profile')}>
              {profile.name || profile.username || 'Profile'}
            </Button>
          ) : (
            <Button onClick={() => router.push('/auth')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

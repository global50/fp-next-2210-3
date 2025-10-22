'use client'

import { createContext, useContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { useAuth } from '@/hooks/use-auth'
import { Profile } from '@/types/profile'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  isAuthenticated: boolean
  logAuthState: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  const logAuthState = () => {
    console.log('=== AUTH STATE DEBUG ===')
    console.log('User:', auth.user)
    console.log('Session:', auth.session)
    console.log('Profile:', auth.profile)
    console.log('Loading:', auth.loading)
    console.log('Is Authenticated:', auth.isAuthenticated)
    console.log('========================')
  }
  return (
    <AuthContext.Provider value={{ ...auth, logAuthState }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
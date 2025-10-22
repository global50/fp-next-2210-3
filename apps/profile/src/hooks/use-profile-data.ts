import { useState, useEffect } from 'react'
import { useAuthContext } from '@/components/auth-provider'
import { Profile } from '@/types/profile'

export function useProfileData() {
  const { profile, user: authUser } = useAuthContext()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 100)
  }, [])

  const refetchProfile = async () => {
    // Placeholder
  }

  return {
    user: profile,
    isLoading,
    error,
    isOwnProfile: true,
    requestedUsername: profile?.username || null,
    redirectPath: null,
    refetchProfile
  }
}

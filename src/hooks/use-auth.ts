'use client'

import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/profile'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Fetch user profile from profiles table using session from context
  const fetchUserProfile = async (userId: string, sessionToUse: Session) => {
    let profileFetched = false;

    // Try to load from local storage first for immediate UI update
    const cachedProfile = localStorage.getItem(`profile_${userId}`)
    if (cachedProfile) {
      try {
        const parsedProfile = JSON.parse(cachedProfile)
        setProfile(parsedProfile)
        console.log('[useAuth] Profile loaded from cache - username:', parsedProfile.username || 'no username')
      } catch (e) {
        console.warn('[useAuth] Failed to parse cached profile, removing bad cache:', e)
        localStorage.removeItem(`profile_${userId}`)
      }
    }

    try {
      if (!sessionToUse?.access_token) {
        console.error('[useAuth] ERROR: No access token available')
        setProfile(null)
        return
      }

      console.log('[useAuth] Making fetch request with provided session token...')
      // Make a request to the Edge Function
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-auth-profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToUse.access_token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        console.error('[useAuth] ERROR: Edge Function returned error:', response.status, errorData.error)
        setProfile(null)
        return
      }

      const data = await response.json()
      setProfile(data)
      profileFetched = true;

      // Save to cache for future use
      localStorage.setItem(`profile_${userId}`, JSON.stringify(data))
      console.log('[useAuth] Profile cached for user:', userId)

    } catch (error) {
      console.error('[useAuth] EXCEPTION: Failed to fetch profile:', error)
      setProfile(null)
    } finally {
      // Ensure loading state is properly handled even if profile fetch fails
      if (!profileFetched && !localStorage.getItem(`profile_${userId}`)) {
        console.warn('[useAuth] Profile fetch failed, but stopping loading state to prevent infinite loading')
      }
    }
  }

  useEffect(() => {
    let isSubscribed = true

    const initAuth = async () => {
      try {
        console.log('[Auth Init] Starting initial session hydration')
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()

        if (!isSubscribed) return

        if (error) {
          console.error('[Auth Init] Error fetching initial session:', error)
          setSession(null)
          setUser(null)
          setProfile(null)
          setInitialLoadComplete(true)
          return
        }

        if (initialSession) {
          console.log('[Auth Init] Initial session hydrated: Active session')
          setSession(initialSession)
          setUser(initialSession.user)
          await fetchUserProfile(initialSession.user.id, initialSession)
        } else {
          console.log('[Auth Init] No initial session found')
          setSession(null)
          setUser(null)
          setProfile(null)
        }

        setInitialLoadComplete(true)
        console.log('[Auth Init] Initial session loaded successfully')
      } catch (error) {
        console.error('[Auth Init] Error during auth initialization:', error)
        setInitialLoadComplete(true)
      }
    }

    initAuth()

    // Listen for auth changes (but don't call getSession again)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isSubscribed) return

        console.log('[useAuth] Auth state change:', event)

        setSession(session)
        setUser(session?.user ?? null)

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('[useAuth] User signed in')
            // Only fetch if we don't already have profile data from initial load
            if (session?.user && !profile) {
              await fetchUserProfile(session.user.id, session)
            }
            break
          case 'SIGNED_OUT':
            console.log('[useAuth] User signed out')
            setProfile(null)
            break
          case 'TOKEN_REFRESHED':
            console.log('[useAuth] Token refreshed')
            break
          default:
            break
        }
      }
    )

    return () => {
      isSubscribed = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    // Clear cached profile data on sign out
    if (user?.id) {
      localStorage.removeItem(`profile_${user.id}`)
      
    }
    
    console.log('[useAuth] Initiating sign out...')
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[useAuth] Error signing out:', error)
    } else {
   
    }
  }

  // Derive loading state - only loading until initial load completes
  const loading = !initialLoadComplete

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    isAuthenticated: !!user
  }
}

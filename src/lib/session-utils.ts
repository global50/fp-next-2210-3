import { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export function isSessionFresh(session: Session | null, thresholdSeconds: number = 30): boolean {
  if (!session?.expires_at) {
    return false
  }

  const secondsLeft = session.expires_at - Math.floor(Date.now() / 1000)
  return secondsLeft > thresholdSeconds
}

export function getSessionExpiryInfo(session: Session | null) {
  if (!session?.expires_at) {
    return {
      isValid: false,
      secondsLeft: 0,
      expiresAt: null,
      willExpireSoon: false
    }
  }

  const secondsLeft = session.expires_at - Math.floor(Date.now() / 1000)
  const isValid = secondsLeft > 0
  const willExpireSoon = secondsLeft <= 300

  return {
    isValid,
    secondsLeft,
    expiresAt: new Date(session.expires_at * 1000),
    willExpireSoon
  }
}

export async function ensureFreshSession(session: Session | null): Promise<Session | null> {
  if (!session) {
    console.warn('[Session Utils] No session provided')
    return null
  }

  const expiryInfo = getSessionExpiryInfo(session)

  if (!expiryInfo.isValid) {
    console.warn('[Session Utils] Session is expired')
    return null
  }

  if (expiryInfo.willExpireSoon) {
    console.log('[Session Utils] Session will expire soon, refreshing...')
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error('[Session Utils] Failed to refresh session:', error)
      return session
    }

    if (data.session) {
      console.log('[Session Utils] Session refreshed successfully')
      return data.session
    }
  }

  return session
}

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AuthState, AuthStatusResponse } from '../types/auth';

interface UseTelegramAuthReturn {
  isLoading: boolean;
  telegramUrl: string | null;
  error: string | null;
  handleTelegramAuth: () => void;
}

export function useTelegramAuth(): UseTelegramAuthReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const stateRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef<boolean>(false);
  const hasAuthCompletedRef = useRef<boolean>(false);

  // Initialize auth flow on component mount
  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeAuth();
    }
    
    return cleanup;
  }, []);

  const cleanup = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const redirectToHome = () => {
    router.push('/');
  };

  const deleteAuthState = async () => {
    if (!stateRef.current) return;
    
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-auth-state`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ state: stateRef.current })
        }
      );
    } catch (error) {
      console.error('Failed to delete auth state:', error);
      // Don't throw error as this is cleanup operation
    }
  };

  const handleTelegramAuth = () => {
    if (telegramUrl) {
      // Always open Telegram URL in new tab
      window.open(telegramUrl, '_blank');
    }
  };

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use localhost for development - this should be configurable in production
      const initiatingHostOrigin = 'http://localhost:5173';

      // Generate auth state
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-auth-state`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initiatingHostOrigin })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate auth state');
      }

      const data: AuthState = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate auth state');
      }

      stateRef.current = data.state;
      setTelegramUrl(data.redirect_url);
      
      // Start polling for auth completion
      startPolling();
      
      // Set timeout for auto-redirect
      timeoutRef.current = setTimeout(() => {
        // Clean up auth state if authentication was not completed
        if (!hasAuthCompletedRef.current) {
          deleteAuthState();
        }
        cleanup();
        redirectToHome();
      }, 3 * 60 * 1000); // 3 minutes

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    if (!stateRef.current) return;

    pollingIntervalRef.current = setInterval(async () => {
      // Stop polling if authentication has already completed
      if (hasAuthCompletedRef.current) {
        cleanup();
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-auth-session?state=${stateRef.current}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (!response.ok) {
          // If auth has completed, don't treat server cleanup as an error
          if (hasAuthCompletedRef.current) {
            cleanup();
            return;
          }
          throw new Error('Failed to check auth status');
        }

        const data: AuthStatusResponse = await response.json();
        
        if (data.success && data.completed && data.magic_link) {
          // Authentication completed successfully
          hasAuthCompletedRef.current = true;
          cleanup();
          
          // Redirect to magic link for automatic authentication
          window.location.href = data.magic_link;
        }
      } catch (err) {
        // Only show error if authentication hasn't completed successfully
        if (!hasAuthCompletedRef.current) {
          console.error('Polling error:', err);
          setError(err instanceof Error ? err.message : 'Authentication failed');
          cleanup();
        } else {
          // Auth completed, just cleanup without error
          cleanup();
        }
      }
    }, 3000); // Poll every 3 seconds
  };

  return {
    isLoading,
    telegramUrl,
    error,
    handleTelegramAuth
  };
}
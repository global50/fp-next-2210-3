/*
  # Fetch Profile by Username Edge Function

  1. Purpose
    - Fetches public profile data by username
    - Used when users visit profile pages like /jordansmith, /john_doe
    - Returns sanitized profile data for public viewing

  2. Security
    - Uses anon key for public profile access
    - Only returns public profile fields
    - Validates username format
    - Handles CORS for cross-origin requests

  3. Response Format
    - Returns profile object or null if not found
    - Includes error handling for invalid requests
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ProfileData {
  id: string
  name: string | null
  username: string | null
  about: string | null
  avatar_url: string | null
  cover_url: string | null
  profile_type: string | null
  badge: string[] | null
  telegram_username: string | null
  created_at: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { username } = await req.json()

    // Validate username
    if (!username || typeof username !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Username is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate username format (alphanumeric, underscores, hyphens, 3-30 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
    if (!usernameRegex.test(username)) {
      return new Response(
        JSON.stringify({ error: 'Invalid username format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client with anon key for public access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Fetch profile by username
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        username,
        about,
        avatar_url,
        cover_url,
        profile_type,
        badge,
        contact_info,
        created_at
      `)
      .eq('username', username)
      .single()

    if (error) {
      // If profile not found, return null (not an error)
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ profile: null }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return the profile data
    return new Response(
      JSON.stringify({ profile }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
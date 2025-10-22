import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Get request body for app redirect URL
    const requestBody = await req.json();
    const { initiatingHostOrigin } = requestBody;
    
    if (!initiatingHostOrigin) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing initiatingHostOrigin parameter'
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          status: 400
        }
      );
    }

    // Initialize Supabase admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Generate secure random state
    const stateArray = new Uint8Array(24);
    crypto.getRandomValues(stateArray);
    const state = Array.from(stateArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Store the state in the database with 3-minute expiration
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);
    
    const { error } = await supabaseAdmin
      .from('auth_states')
      .insert({
        state,
        expires_at: expiresAt.toISOString(),
        auth_completed: false,
        initiating_host_origin: initiatingHostOrigin
      });
      
    if (error) {
      throw new Error(`Failed to store state: ${error.message}`);
    }
    
    // Generate Telegram URL
    const tgBotUsername = Deno.env.get('TELEGRAM_BOT_USERNAME') || 'fondprava_bot';
    const telegramUrl = `https://t.me/${tgBotUsername}?start=auth_${state}`;
    
    // Return the URL and state
    return new Response(
      JSON.stringify({
        success: true,
        state,
        redirect_url: telegramUrl
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error generating auth state:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 500
      }
    );
  }
});
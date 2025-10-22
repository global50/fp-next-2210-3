interface SettingsRequest {
  action: 'get' | 'update';
  timezone?: string;
  theme_mode?: 'light' | 'dark' | 'system';
}

interface SettingsResponse {
  success: boolean;
  data?: {
    timezone: string;
    theme_mode: string;
  };
  error?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client with service role for server-side operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user token and get user info
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body for POST requests
    let requestData: SettingsRequest = { action: 'get' };
    if (req.method === 'POST') {
      requestData = await req.json();
    }

    let response: SettingsResponse;

    switch (requestData.action) {
      case 'get':
        // Fetch user settings
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('timezone, theme_mode')
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            response = { success: false, error: 'User profile not found' };
          } else {
            response = { success: false, error: `Database error: ${fetchError.message}` };
          }
        } else {
          response = {
            success: true,
            data: {
              timezone: profile.timezone || 'UTC',
              theme_mode: profile.theme_mode || 'system'
            }
          };
        }
        break;

      case 'update':
        // Update user settings
        if (!requestData.timezone && !requestData.theme_mode) {
          response = { success: false, error: 'No settings provided to update' };
          break;
        }

        const updateData: any = {};
        if (requestData.timezone) updateData.timezone = requestData.timezone;
        if (requestData.theme_mode) updateData.theme_mode = requestData.theme_mode;

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', user.id);

        if (updateError) {
          response = { success: false, error: `Update failed: ${updateError.message}` };
        } else {
          // Fetch updated settings to return
          const { data: updatedProfile, error: refetchError } = await supabase
            .from('profiles')
            .select('timezone, theme_mode')
            .eq('user_id', user.id)
            .single();

          if (refetchError) {
            response = { success: false, error: `Failed to fetch updated settings: ${refetchError.message}` };
          } else {
            response = {
              success: true,
              data: {
                timezone: updatedProfile.timezone || 'UTC',
                theme_mode: updatedProfile.theme_mode || 'system'
              }
            };
          }
        }
        break;

      default:
        response = { success: false, error: 'Invalid action' };
    }

    return new Response(
      JSON.stringify(response),
      {
        status: response.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Settings function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
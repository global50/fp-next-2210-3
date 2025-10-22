import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

// Static configuration - must match frontend constants
const HOST_REDIRECT_PATH = '/profile';

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

    // Get state from query parameters
    const url = new URL(req.url);
    const state = url.searchParams.get('state');
    
    console.log('=== GET-AUTH-SESSION DEBUG ===');
    console.log('Received state parameter:', state);
    console.log('Full URL:', req.url);
    
    if (!state) {
      console.log('ERROR: Missing state parameter');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing state parameter'
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

    // Initialize Supabase admin client
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
    
    console.log('Supabase admin client initialized successfully');
    
    // Add comprehensive logging to diagnose the issue
    console.log('=== SUPABASE ADMIN CLIENT DEBUGGING ===');
    console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? 'Present' : 'Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Present' : 'Missing');
    console.log('supabaseAdmin initialized');
    console.log('supabaseAdmin.auth:', typeof supabaseAdmin.auth, supabaseAdmin.auth ? 'Present' : 'Missing');
    console.log('supabaseAdmin.auth.admin:', typeof supabaseAdmin.auth?.admin, supabaseAdmin.auth?.admin ? 'Present' : 'Missing');
    console.log('supabaseAdmin.auth.admin.users:', typeof supabaseAdmin.auth?.admin?.users, supabaseAdmin.auth?.admin?.users ? 'Present' : 'Missing');
    
    // Log available methods on admin object
    if (supabaseAdmin.auth?.admin) {
      console.log('Available admin methods:', Object.keys(supabaseAdmin.auth.admin));
    }
    
    // Log available methods on users object if it exists
    if (supabaseAdmin.auth?.admin?.users) {
      console.log('Available users methods:', Object.keys(supabaseAdmin.auth.admin.users));
    }
    console.log('=== END DEBUGGING ===');
    
    // Check if auth has been completed for this state
    console.log('Querying auth_states table for state:', state);
    console.log('Current timestamp:', new Date().toISOString());
    
    const { data: authState, error: authStateError } = await supabaseAdmin
      .from('auth_states')
      .select('*, initiating_host_origin')
      .eq('state', state)
      .gte('expires_at', new Date().toISOString())
      .single();
      
    console.log('Auth state query result:');
    console.log('- authState:', authState);
    console.log('- authStateError:', authStateError);
    
    if (authStateError || !authState) {
      console.log('ERROR: Invalid or expired state');
      console.log('- Error details:', authStateError);
      console.log('- Auth state data:', authState);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid or expired state'
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          status: 401
        }
      );
    }
    
    // Check if authentication has been completed
    console.log('Checking if auth is completed:');
    console.log('- auth_completed:', authState.auth_completed);
    console.log('- completed_by_user_id:', authState.completed_by_user_id);
    
    if (!authState.auth_completed || !authState.completed_by_user_id) {
      console.log('Auth not yet completed, returning 202');
      return new Response(
        JSON.stringify({
          success: true,
          completed: false,
          message: 'Authentication in progress'
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          status: 202
        }
      );
    }
    
    // Authentication completed, generate session tokens securely
    console.log('Getting user details for:', authState.completed_by_user_id);
    
    // Construct redirect URL using stored initiating host origin and static path
    if (!authState.initiating_host_origin) {
      throw new Error('Missing initiating host origin in auth state');
    }
    
    const redirectUrl = `${authState.initiating_host_origin}${HOST_REDIRECT_PATH}`;
    
    console.log('Using redirect URL:', redirectUrl);
    
    // Get user details to retrieve email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(authState.completed_by_user_id);
    
    console.log('User retrieval result:');
    console.log('- userData:', userData);
    console.log('- userError:', userError);
    
    if (userError || !userData.user) {
      console.error('User retrieval error:', userError);
      throw new Error(`Failed to retrieve user: ${userError?.message}`);
    }
    
    const userEmail = userData.user.email;
    console.log('User email retrieved:', userEmail);
    
    if (!userEmail) {
      throw new Error('User email not found');
    }
    
    console.log('Generating magic link for user email:', userEmail);
    
    // Generate magic link for the user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
      redirectTo: redirectUrl
    });
    
    console.log('Magic link generation result:');
    console.log('- linkData:', linkData);
    console.log('- linkError:', linkError);
    
    if (linkError || !linkData.properties?.action_link) {
      console.error('Magic link generation error:', linkError);
      throw new Error(`Failed to generate magic link: ${linkError?.message}`);
    }
    
    console.log('Magic link generated successfully, deleting auth state');
    // Remove the state record as it's no longer needed
    const { error: deleteError } = await supabaseAdmin
      .from('auth_states')
      .delete()
      .eq('state', state);
    
    console.log('Auth state deletion result:');
    console.log('- deleteError:', deleteError);
    
    if (deleteError) {
      console.error('Failed to delete auth state:', deleteError);
      // Don't throw error here as session was created successfully
    }
    
    console.log('Auth flow completed successfully');
    // Return the magic link URL for client-side redirect
    return new Response(
      JSON.stringify({
        success: true,
        completed: true,
        magic_link: linkData.properties.action_link,
        user_id: authState.completed_by_user_id
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
    console.error('Error checking auth status:', error);
    console.error('Error stack:', error.stack);
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
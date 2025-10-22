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

    // Get request data from the bot
    const { 
      state, 
      telegram_user_id,
      telegram_full_name,
      telegram_username,
      webhook_secret // For verifying the request came from your bot
    } = await req.json();
    
    // Verify this request is from your bot
    const expectedSecret = Deno.env.get('WEBHOOK_SECRET');
    if (!expectedSecret || webhook_secret !== expectedSecret) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized'
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
    
    // Verify the state exists and hasn't expired
    const { data: authState, error: authStateError } = await supabaseAdmin
      .from('auth_states')
      .select('*')
      .eq('state', state)
      .gte('expires_at', new Date().toISOString())
      .single();
      
    if (authStateError || !authState) {
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
          status: 400
        }
      );
    }
    
    // Check if this state has already been used
    if (authState.auth_completed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'State already used'
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
    
    // Check if user already exists by telegram_id
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('telegram_id', telegram_user_id.toString())
      .single();
    
    let userId: string;
    let isNewUser = false;
    
    if (existingProfile?.user_id) {
      // User exists, use existing user_id
      userId = existingProfile.user_id;
    } else {
      // Create new user
      isNewUser = true;
      // Generate 9 random alphanumeric characters for email
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomEmailSuffix = '';
      for (let i = 0; i < 9; i++) {
        randomEmailSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const email = `${randomEmailSuffix}@local.local`;
      const password = crypto.randomUUID(); // Random password never used
      
      // Create the Supabase user
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        // user_metadata is intentionally not set here to avoid storing Telegram data in auth.users
      });
      
      if (userError || !userData.user) {
        throw new Error(`Failed to create user: ${userError?.message}`);
      }
      
      userId = userData.user.id;

      // Generate 6 random alphanumeric characters for username suffix
      const numericChars = '0123456789';
      let randomUsernameSuffix = '';
      for (let i = 0; i < 6; i++) {
        randomUsernameSuffix += numericChars.charAt(Math.floor(Math.random() * numericChars.length));
      }
      const newUsername = `id${randomUsernameSuffix}`;
      
      // Create profile record
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          telegram_id: telegram_user_id.toString(),
          telegram_username: telegram_username,
          name: telegram_full_name,
          profile_type: 'user', // Set profile_type to 'user'
          username: newUsername // Set the generated username
        });
        
      if (profileError) {
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }
    }
    
    // Mark the auth state as completed
    const { error: updateError } = await supabaseAdmin
      .from('auth_states')
      .update({
        auth_completed: true,
        completed_by_user_id: userId
      })
      .eq('state', state);
      
    if (updateError) {
      throw new Error(`Failed to update auth state: ${updateError.message}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: isNewUser ? 'User created and authenticated' : 'User authenticated',
        user_id: userId
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
    console.error('Error processing platform auth:', error);
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
}
)
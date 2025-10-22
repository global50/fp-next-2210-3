import { createClient } from 'npm:@supabase/supabase-js@2.57.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactInfoEntry {
  id: string;
  type: 'phone' | 'email' | 'telegram' | 'whatsapp' | 'github' | 'linkedin' | 'twitter' | 'website' | 'link';
  value: string;
  label?: string;
  order: number;
  is_whatsapp?: boolean;
}

interface ProfileUpdatePayload {
  contact_info?: ContactInfoEntry[];
  about?: string;
  name?: string;
  avatar_url?: string;
  profile_type?: string;
  badge?: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  console.log('=========================================');
  console.log('🚀 [Update Profile] Edge function called at:', new Date().toISOString());
  console.log('=========================================');

  try {
    console.log('🔐 [Update Profile] Step 1: Checking authorization header');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ [Update Profile] Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
        }
      );
    }

    console.log('✅ [Update Profile] Authorization header present');

    console.log('🔧 [Update Profile] Step 2: Creating Supabase client');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    console.log('👤 [Update Profile] Step 3: Verifying user authentication');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('❌ [Update Profile] User authentication failed:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token or user not found' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
        }
      );
    }

    console.log('✅ [Update Profile] User authenticated:', user.id);

    console.log('📦 [Update Profile] Step 4: Parsing request payload');
    const payload: ProfileUpdatePayload = await req.json();

    console.log('📋 [Update Profile] Payload received:', {
      hasContactInfo: payload.contact_info !== undefined,
      contactInfoCount: payload.contact_info?.length || 0,
      hasAbout: payload.about !== undefined,
      hasName: payload.name !== undefined,
      hasAvatarUrl: payload.avatar_url !== undefined,
      hasProfileType: payload.profile_type !== undefined,
      hasBadge: payload.badge !== undefined,
    });

    if (Object.keys(payload).length === 0) {
      console.error('❌ [Update Profile] No update fields provided');
      return new Response(
        JSON.stringify({ error: 'No update fields provided' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
        }
      );
    }

    console.log('🔍 [Update Profile] Step 5: Validating and preparing update data');
    const updateData: any = {};

    if (payload.contact_info !== undefined) {
      console.log('📞 [Update Profile] Validating contact_info');
      if (!Array.isArray(payload.contact_info)) {
        return new Response(
          JSON.stringify({ error: 'Invalid contact_info: must be an array' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
          }
        );
      }

      for (const entry of payload.contact_info) {
        if (!entry.id || !entry.type || !entry.value || typeof entry.order !== 'number') {
          console.error('❌ [Update Profile] Invalid contact entry:', entry);
          return new Response(
            JSON.stringify({ error: 'Invalid contact entry: missing required fields' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              },
            }
          );
        }

        const validTypes = ['phone', 'email', 'telegram', 'whatsapp', 'github', 'linkedin', 'twitter', 'website', 'link'];
        if (!validTypes.includes(entry.type)) {
          console.error('❌ [Update Profile] Invalid contact type:', entry.type);
          return new Response(
            JSON.stringify({ error: `Invalid contact type: ${entry.type}` }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              },
            }
          );
        }
      }

      console.log('✅ [Update Profile] contact_info validated');
      updateData.contact_info = payload.contact_info;
    }

    if (payload.about !== undefined) {
      console.log('📝 [Update Profile] About field updated');
      updateData.about = payload.about;
    }

    if (payload.name !== undefined) {
      console.log('👤 [Update Profile] Name field updated');
      updateData.name = payload.name;
    }

    if (payload.avatar_url !== undefined) {
      console.log('🖼️ [Update Profile] Avatar URL updated');
      updateData.avatar_url = payload.avatar_url;
    }

    if (payload.profile_type !== undefined) {
      console.log('🏷️ [Update Profile] Profile type updated');
      updateData.profile_type = payload.profile_type;
    }

    if (payload.badge !== undefined) {
      if (!Array.isArray(payload.badge)) {
        console.error('❌ [Update Profile] Invalid badge: not an array');
        return new Response(
          JSON.stringify({ error: 'Invalid badge: must be an array' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
          }
        );
      }
      console.log('🎖️ [Update Profile] Badge updated');
      updateData.badge = payload.badge;
    }

    console.log('✅ [Update Profile] All fields validated');
    console.log('📊 [Update Profile] Update data keys:', Object.keys(updateData));

    console.log('💾 [Update Profile] Step 6: Updating profile in database');
    console.log('💾 [Update Profile] User ID:', user.id);

    const { data: profile, error: updateError } = await supabaseClient
      .from('profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [Update Profile] Database update failed:', updateError);
      console.error('❌ [Update Profile] Error code:', updateError.code);
      console.error('❌ [Update Profile] Error message:', updateError.message);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
        }
      );
    }

    console.log('✅ [Update Profile] Profile updated successfully');
    console.log('✅ [Update Profile] Updated profile ID:', profile?.id);

    console.log('=========================================');
    console.log('✅ [Update Profile] Operation completed successfully');
    console.log('=========================================');

    return new Response(
      JSON.stringify({ success: true, profile }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      }
    );

  } catch (error) {
    console.log('=========================================');
    console.error('❌ [Update Profile] Unexpected error occurred');
    console.error('❌ [Update Profile] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('❌ [Update Profile] Error message:', error instanceof Error ? error.message : String(error));
    console.error('❌ [Update Profile] Full error:', error);
    console.log('=========================================');

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      }
    );
  }
});

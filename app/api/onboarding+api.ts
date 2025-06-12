import { databaseService } from '@/lib/database';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      age, 
      gender, 
      city, 
      state, 
      country, 
      interests, 
      intent 
    } = body;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Create user profile
    const { data, error } = await databaseService.createUser({
      id: user.id,
      email: user.email!,
      name,
      age,
      gender,
      city,
      state,
      country,
      interests,
      intent,
      iq_score: 0,
      eq_score: 0,
      profile_completed: false,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
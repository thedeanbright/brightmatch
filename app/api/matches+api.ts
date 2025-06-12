import { databaseService } from '@/lib/database';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Try to find matches first, fallback to discovery users
    let { data, error } = await databaseService.findMatches(user.id);
    
    if (error || !data || data.length === 0) {
      // Fallback to general discovery users
      const discoveryResult = await databaseService.getDiscoveryUsers(user.id, 20);
      data = discoveryResult.data;
      error = discoveryResult.error;
    }

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
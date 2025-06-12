import { databaseService } from '@/lib/database';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { swiped_id, direction } = body;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data, error } = await databaseService.recordSwipe({
      swiper_id: user.id,
      swiped_id,
      direction,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check for mutual right swipes to create a match
    let isMatch = false;
    if (direction === 'right') {
      const { data: mutualSwipe } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', swiped_id)
        .eq('swiped_id', user.id)
        .eq('direction', 'right')
        .single();

      if (mutualSwipe) {
        // Create a match
        const { error: matchError } = await databaseService.createMatch(user.id, swiped_id);
        if (!matchError) {
          isMatch = true;
        }
      }
    }

    return new Response(JSON.stringify({ data, is_match: isMatch }), {
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
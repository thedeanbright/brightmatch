import { databaseService } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const city = url.searchParams.get('city');
    const type = url.searchParams.get('type'); // 'iq' or 'eq'

    const { data, error } = await databaseService.getLeaderboard(city || undefined, type as 'iq' | 'eq');

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sort by the appropriate score type
    const sortedData = data?.sort((a, b) => {
      if (type === 'iq') {
        return b.iq_score - a.iq_score;
      } else if (type === 'eq') {
        return b.eq_score - a.eq_score;
      } else {
        // Default: sort by total score
        return (b.iq_score + b.eq_score) - (a.iq_score + a.eq_score);
      }
    }) || [];

    return new Response(JSON.stringify({ data: sortedData }), {
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
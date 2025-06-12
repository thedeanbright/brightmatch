import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      return new Response('Authentication failed', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  // Redirect to the app
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
    },
  });
}
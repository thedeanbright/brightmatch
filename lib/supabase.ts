import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tpcikdypybopocwggfnf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2lrZHlweWJvcG9jd2dnZm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzcyMjYsImV4cCI6MjA2NTE1MzIyNn0.0m5vl2nV_XPmAZS6iLYjRVA6wK3aZMGBKl6h-3PbbVw';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error);
  } else {
    console.log('Supabase connected successfully');
  }
});
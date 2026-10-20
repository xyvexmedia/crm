import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kzcbkfrbddnhbjcsneno.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6Y2JrZnJiZGRuaGJqY3NuZW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNTgyNjYsImV4cCI6MjEwNDYzNDI2Nn0.zPufowwzkk5SWfFVKr64jNUbKQYhb-aV1yol5rOqfM0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dnrfscucvxkibcswoekr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucmZzY3VjdnhraWJjc3dvZWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjE5NzcsImV4cCI6MjEwMzEzNzk3N30.jgnMqNQQj5oh4eEpkEgdK5OT2emTmlvQyTDdhQKXkMg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

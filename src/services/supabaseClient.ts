import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qyjpecfeaxddtehtizqn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5anBlY2ZlYXhkZHRlaHRpenFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTQ1NDMsImV4cCI6MjA4NzY5MDU0M30.rKlYZyI5b--hqgKZr9-F-7ozw9zzBlE-xNZZqqQPn_A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

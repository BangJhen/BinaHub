import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@binahub.com',
    password: 'AdminBinaHub123!',
  });
  if (error) console.error("Login failed:", error.message);
  else console.log("Login success! User:", data.user?.email);
}
testLogin();

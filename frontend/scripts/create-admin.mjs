import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const email = 'admin@binahub.com';
  const password = 'AdminBinaHub123!';
  const name = 'Admin BinaHub';
  const role = 'admin';

  console.log(`Creating admin account: ${email}...`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (error) {
    console.error("Error creating admin:", error.message);
  } else {
    console.log("Success! Admin user created.");
    console.log("Important: Because email confirmation is enabled on your Supabase project, you must go to your Supabase Dashboard -> Authentication -> Users, and manually 'Confirm' this user's email address before they can log in.");
  }
}

createAdmin();

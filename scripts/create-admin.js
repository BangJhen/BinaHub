#!/usr/bin/env node

/**
 * Create/Reset Admin User
 *
 * Usage:
 *   node scripts/create-admin.js
 *
 * Environment variables required (from .env.local):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('📋 Environment check:');
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}\n`);

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = 'admin@binahub.com';
const ADMIN_PASSWORD = 'AdminBinaHub123!';

async function createAdmin() {
  console.log(`🔧 Creating/resetting admin user: ${ADMIN_EMAIL}\n`);

  // Step 1: Find user ID - check Admin SDK first, then fall back to auth.users via SQL
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Failed to list users:', listError.message);
    process.exit(1);
  }

  const existingUser = existingUsers.users.find(u => u.email === ADMIN_EMAIL);

  // Also check auth.users directly via SQL in case user was created via SQL (not Admin SDK)
  const { data: authUsers } = await supabase
    .from('users')
    .select('id')
    .eq('email', ADMIN_EMAIL)
    .maybeSingle();

  // Get ID from either source
  const existingId = existingUser?.id || authUsers?.id;

  if (existingId) {
    console.log(`⚠️  User ${ADMIN_EMAIL} already exists (ID: ${existingId}). Resetting password...`);

    // Update password using Admin SDK with known ID
    const { data, error } = await supabase.auth.admin.updateUserById(existingId, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'admin', name: 'BinaHub Admin' },
    });

    if (error) {
      console.error('❌ Failed to update user:', error.message);
      // Fallback: try direct SQL update via RPC
      console.log('🔄 Trying fallback method...');
      const { error: sqlError } = await supabase.rpc('reset_user_password', {
        user_email: ADMIN_EMAIL,
        new_password: ADMIN_PASSWORD,
      });
      if (sqlError) {
        console.error('❌ Fallback also failed:', sqlError.message);
        process.exit(1);
      }
    }

    console.log(`✅ Password reset successfully for ${ADMIN_EMAIL}`);
    await syncPublicUser(existingId);

  } else {
    console.log(`➕ Creating new admin user: ${ADMIN_EMAIL}`);

    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'admin', name: 'BinaHub Admin' },
    });

    if (error) {
      console.error('❌ Failed to create user:', error.message);
      process.exit(1);
    }

    console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
    await syncPublicUser(data.user.id);
  }

  console.log('\n🎉 Done! Login credentials:');
  console.log(`   Email   : ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   Role    : admin`);
  console.log('\n🚀 Go to: http://localhost:3000/auth/login');
}

async function syncPublicUser(userId) {
  const { error } = await supabase
    .from('users')
    .upsert(
      {
        id: userId,
        email: ADMIN_EMAIL,
        password_hash: 'managed-by-supabase-auth',
        full_name: 'BinaHub Admin',
        role: 'admin',
        is_verified: true,
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.warn(`⚠️  public.users sync failed: ${error.message}`);
  } else {
    console.log(`✅ public.users synced`);
  }
}

createAdmin();

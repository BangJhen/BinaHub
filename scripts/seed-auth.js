#!/usr/bin/env node

/**
 * Seed Supabase Auth Users
 * 
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key npm run seed:auth
 * 
 * Environment variables required:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (service role, NOT anon key)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const users = [
  // UMKM
  {
    id: '30000000-0000-0000-0000-000000000001',
    email: 'umkm.surya@binahub.id',
    password: 'demo-password-123',
    role: 'umkm',
    name: 'UMKM Surya Pangan',
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    email: 'umkm.kriya@binahub.id',
    password: 'demo-password-123',
    role: 'umkm',
    name: 'UMKM Kriya Nusantara',
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    email: 'umkm.segara@binahub.id',
    password: 'demo-password-123',
    role: 'umkm',
    name: 'UMKM Segara Retail',
  },
  // Workers
  {
    id: '40000000-0000-0000-0000-000000000001',
    email: 'worker.andi@binahub.id',
    password: 'demo-password-123',
    role: 'worker',
    name: 'Andi Pratama',
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    email: 'worker.budi@binahub.id',
    password: 'demo-password-123',
    role: 'worker',
    name: 'Budi Santoso',
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    email: 'worker.citra@binahub.id',
    password: 'demo-password-123',
    role: 'worker',
    name: 'Citra Lestari',
  },
  {
    id: '40000000-0000-0000-0000-000000000004',
    email: 'worker.deni@binahub.id',
    password: 'demo-password-123',
    role: 'worker',
    name: 'Deni Saputra',
  },
  {
    id: '40000000-0000-0000-0000-000000000005',
    email: 'worker.eka@binahub.id',
    password: 'demo-password-123',
    role: 'worker',
    name: 'Eka Wulandari',
  },
  {
    id: '40000000-0000-0000-0000-000000000006',
    email: 'worker.fajar@binahub.id',
    password: 'demo-password-123',
    role: 'worker',
    name: 'Fajar Maulana',
  },
];

async function seedAuth() {
  console.log('🌱 Starting Supabase Auth seed...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          role: user.role,
          name: user.name,
        },
      });

      if (error) {
        // Check if user already exists
        if (error.message.includes('already exists')) {
          console.log(`⚠️  ${user.email} already exists (skipped)`);
        } else {
          console.error(`❌ ${user.email}: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`✅ ${user.email} (${user.role})`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ ${user.email}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount} created, ${errorCount} errors`);

  if (errorCount === 0) {
    console.log('✨ Auth seed completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: db/seed-lowongan.sql in Supabase SQL Editor');
    console.log('   2. Login with any account above');
    process.exit(0);
  } else {
    console.log('⚠️  Some users failed to create. Check errors above.');
    process.exit(1);
  }
}

seedAuth();

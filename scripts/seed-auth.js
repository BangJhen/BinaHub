#!/usr/bin/env node

/**
 * Seed Supabase Auth Users
 * 
 * Usage:
 *   npm run seed:auth
 * 
 * Environment variables required (from .env.local):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (service role, NOT anon key)
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
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Make sure .env.local exists in project root');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const users = [
  // UMKM — fixed UUIDs must match seed-lowongan.sql
  {
    id: '30000000-0000-0000-0000-000000000001',
    email: 'umkm.surya@binahub.id',
    password: 'demo-password-123',
    role: 'umkm',
    name: 'UMKM Surya Pangan',
    profile: {
      business_name: 'UMKM Surya Pangan',
      business_sector: 'Kuliner',
      city: 'Bandung',
      province: 'Jawa Barat',
    },
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    email: 'umkm.kriya@binahub.id',
    password: 'demo-password-123',
    role: 'umkm',
    name: 'UMKM Kriya Nusantara',
    profile: {
      business_name: 'UMKM Kriya Nusantara',
      business_sector: 'Kerajinan',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
    },
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    email: 'umkm.segara@binahub.id',
    password: 'demo-password-123',
    role: 'umkm',
    name: 'UMKM Segara Retail',
    profile: {
      business_name: 'UMKM Segara Retail',
      business_sector: 'Retail',
      city: 'Surabaya',
      province: 'Jawa Timur',
    },
  },
  // Workers — fixed UUIDs must match seed-lowongan.sql
  {
    id: '40000000-0000-0000-0000-000000000001',
    email: 'worker.andi@binahub.id',
    password: 'demo-password-123',
    role: 'worker',
    name: 'Andi Pratama',
    profile: {
      city: 'Bandung',
      education_level: 'SMA/SMK',
      skills: 'Kasir, Operasional Toko, Customer Service',
      experience_summary: 'Pernah bekerja sebagai kasir minimarket selama 1 tahun.',
    },
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    email: 'worker.budi@binahub.id',
    password: 'demo-password-123',
    role: 'worker',
    name: 'Budi Santoso',
    profile: {
      city: 'Bandung',
      education_level: 'SMA/SMK',
      skills: 'Gudang, Manajemen Stok, Operasional',
      experience_summary: 'Berpengalaman di bagian gudang dan stok barang.',
    },
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    email: 'worker.citra@binahub.id',
    password: 'demo-password-123',
    role: 'worker',
    name: 'Citra Lestari',
    profile: {
      city: 'Yogyakarta',
      education_level: 'SMA/SMK',
      skills: 'Administrasi, Input Data, Ms. Excel',
      experience_summary: 'Terbiasa input data harian dan membuat laporan Excel.',
    },
  },
  {
    id: '40000000-0000-0000-0000-000000000004',
    email: 'worker.deni@binahub.id',
    password: 'demo-password-123',
    role: 'worker',
    name: 'Deni Saputra',
    profile: {
      city: 'Yogyakarta',
      education_level: 'SMA/SMK',
      skills: 'Kurir, SIM C, Navigasi, Komunikasi',
      experience_summary: 'Pernah jadi kurir internal UMKM, hafal jalan Yogyakarta.',
    },
  },
  {
    id: '40000000-0000-0000-0000-000000000005',
    email: 'worker.eka@binahub.id',
    password: 'demo-password-123',
    role: 'worker',
    name: 'Eka Wulandari',
    profile: {
      city: 'Surabaya',
      education_level: 'SMA/SMK',
      skills: 'Operasional Toko, Display Produk, Manajemen Stok',
      experience_summary: 'Berpengalaman 2 tahun di toko retail, terbiasa menata display.',
    },
  },
  {
    id: '40000000-0000-0000-0000-000000000006',
    email: 'worker.fajar@binahub.id',
    password: 'demo-password-123',
    role: 'worker',
    name: 'Fajar Maulana',
    profile: {
      city: 'Surabaya',
      education_level: 'SMA/SMK',
      skills: 'Kasir, Pelayanan Pelanggan, POS System',
      experience_summary: 'Terbiasa menangani transaksi harian dan pelayanan pelanggan.',
    },
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
          ...(user.role === 'umkm' ? { businessName: user.name } : {}),
        },
      });

      // Sync to public.users with fixed UUID
      if (!error && data?.user) {
        const userId = data.user.id;
        await supabase.from('users').upsert({
          id: userId,
          email: user.email,
          password_hash: 'managed-by-supabase-auth',
          full_name: user.name,
          role: user.role,
          is_verified: true,
        }, { onConflict: 'id' });

        // Create profile
        if (user.role === 'umkm' && user.profile) {
          await supabase.from('umkm_profiles').upsert({
            user_id: userId,
            business_name: user.profile.business_name,
            business_sector: user.profile.business_sector,
            city: user.profile.city,
            province: user.profile.province,
          }, { onConflict: 'user_id' });
        }
        if (user.role === 'worker' && user.profile) {
          await supabase.from('worker_profiles').upsert({
            user_id: userId,
            skills: user.profile.skills,
            city: user.profile.city,
            education_level: user.profile.education_level,
            experience_summary: user.profile.experience_summary,
          }, { onConflict: 'user_id' });
        }
      }

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

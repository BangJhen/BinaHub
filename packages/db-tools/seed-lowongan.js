#!/usr/bin/env node

/**
 * Seed Lowongan, Job Applications, dan Saved Jobs
 * Dynamically fetches user IDs so it works regardless of UUID assignment.
 *
 * Usage:
 *   npm run seed:lowongan
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function getUserIds() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email')
    .in('email', [
      'umkm.surya@binahub.id',
      'umkm.kriya@binahub.id',
      'umkm.segara@binahub.id',
      'worker.andi@binahub.id',
      'worker.budi@binahub.id',
      'worker.citra@binahub.id',
      'worker.deni@binahub.id',
      'worker.eka@binahub.id',
      'worker.fajar@binahub.id',
    ]);

  if (error) throw new Error(`Failed to fetch users: ${error.message}`);
  if (data.length < 9) throw new Error(`Expected 9 users, found ${data.length}. Run seed:auth first.`);

  const map = {};
  data.forEach(u => { map[u.email] = u.id; });
  return map;
}

async function cleanExisting(ids) {
  const umkmIds = [ids['umkm.surya@binahub.id'], ids['umkm.kriya@binahub.id'], ids['umkm.segara@binahub.id']];
  const workerIds = [
    ids['worker.andi@binahub.id'], ids['worker.budi@binahub.id'],
    ids['worker.citra@binahub.id'], ids['worker.deni@binahub.id'],
    ids['worker.eka@binahub.id'], ids['worker.fajar@binahub.id'],
  ];

  // Delete in correct order
  await supabase.from('saved_jobs').delete().in('worker_id', workerIds);
  await supabase.from('job_applications').delete().in('worker_id', workerIds);
  const { data: existingJobs } = await supabase.from('jobs').select('id').in('umkm_id', umkmIds);
  if (existingJobs?.length) {
    await supabase.from('jobs').delete().in('umkm_id', umkmIds);
  }
  console.log('🧹 Cleaned existing lowongan data');
}

async function seedJobs(ids) {
  const surya  = ids['umkm.surya@binahub.id'];
  const kriya  = ids['umkm.kriya@binahub.id'];
  const segara = ids['umkm.segara@binahub.id'];

  const jobs = [
    // UMKM Surya Pangan — Bandung, Kuliner
    {
      umkm_id: surya, title: 'Barista Kafe Cabang Cibaduyut',
      description: 'Meracik berbagai jenis minuman kopi sesuai resep standar kafe.\nMelayani pelanggan dengan ramah dan menjaga kualitas rasa konsisten.\nMenjaga kebersihan area bar dan peralatan kerja.',
      requirements: 'Pendidikan minimal SMA/SMK.\nLebih disukai berpengalaman sebagai barista.\nRamah, cekatan, dan menyukai dunia kopi.',
      employment_type: 'Full Time', location: 'Bandung',
      salary_min: 3000000, salary_max: 4200000,
      skills: ['Latte Art', 'Customer Service', 'Meracik Kopi', 'Operasional Bar'],
      benefits: ['BPJS Kesehatan', 'Makan Siang', 'Tips Pelanggan', 'Pelatihan Kopi'],
      education_level: 'SMA/SMK', experience_required: 'Fresh Graduate diperbolehkan',
      age_range: '18 - 30 Tahun', status: 'open',
    },
    {
      umkm_id: surya, title: 'Staff Operasional Toko Pusat',
      description: 'Menangani operasional harian toko dari opening hingga closing.\nMelayani pelanggan dan menjaga ketersediaan produk di rak.',
      requirements: 'Pendidikan minimal SMA/SMK.\nDisiplin, komunikatif, dan siap bekerja shift.',
      employment_type: 'Full Time', location: 'Bandung',
      salary_min: 2800000, salary_max: 3600000,
      skills: ['Customer Service', 'Operasional Toko', 'Manajemen Stok', 'Komunikasi'],
      benefits: ['BPJS Kesehatan', 'BPJS Ketenagakerjaan', 'Bonus Bulanan', 'THR'],
      education_level: 'SMA/SMK', experience_required: 'Fresh Graduate diperbolehkan',
      age_range: '18 - 28 Tahun', status: 'open',
    },
    {
      umkm_id: surya, title: 'Kasir Outlet Bandung Selatan',
      description: 'Melayani pembayaran pelanggan dengan ramah dan akurat.\nMengelola transaksi tunai dan non-tunai (QRIS, debit, kredit).',
      requirements: 'Pendidikan minimal SMA/SMK.\nMampu menghitung cepat, jujur, dan teliti.',
      employment_type: 'Full Time', location: 'Bandung',
      salary_min: 2700000, salary_max: 3300000,
      skills: ['Kasir', 'POS System', 'Customer Service', 'Menghitung Cepat'],
      benefits: ['BPJS Kesehatan', 'Bonus Kehadiran', 'Makan Siang'],
      education_level: 'SMA/SMK', experience_required: 'Fresh Graduate diperbolehkan',
      age_range: '18 - 30 Tahun', status: 'open',
    },
    {
      umkm_id: surya, title: 'Helper Dapur (Part Time)',
      description: 'Membantu chef menyiapkan bahan baku masakan.\nMembersihkan peralatan dapur dan menjaga sanitasi.',
      requirements: 'Sehat jasmani dan kuat fisik.\nBersedia bekerja shift sore (15.00 - 22.00).',
      employment_type: 'Part Time', location: 'Bandung',
      salary_min: 1500000, salary_max: 2200000,
      skills: ['Food Safety', 'Sanitasi Dapur', 'Tanggap', 'Tim Player'],
      benefits: ['Makan 2x', 'Bonus Kehadiran'],
      education_level: 'SMP/SMA', experience_required: 'Fresh Graduate diperbolehkan',
      age_range: '18 - 35 Tahun', status: 'open',
    },

    // UMKM Kriya Nusantara — Yogyakarta, Kerajinan
    {
      umkm_id: kriya, title: 'Admin Gudang Workshop',
      description: 'Mengelola stok bahan baku dan barang jadi workshop kerajinan.\nMencatat data inventory secara rapi pada sistem.',
      requirements: 'Pendidikan minimal SMA/SMK.\nTeliti dan menguasai Microsoft Excel dasar.',
      employment_type: 'Full Time', location: 'Yogyakarta',
      salary_min: 3000000, salary_max: 3800000,
      skills: ['Ms. Excel', 'Manajemen Stok', 'Administrasi', 'Input Data'],
      benefits: ['BPJS Ketenagakerjaan', 'Makan Siang', 'Bonus Lembur'],
      education_level: 'SMA/SMK', experience_required: '1 Tahun',
      age_range: '20 - 35 Tahun', status: 'open',
    },
    {
      umkm_id: kriya, title: 'Sales Counter Galeri Souvenir',
      description: 'Memberikan informasi produk kerajinan kepada pelanggan domestik dan turis.\nMencapai target penjualan bulanan.',
      requirements: 'Komunikasi yang baik. Bahasa Inggris dasar nilai tambah.\nRamah dan termotivasi mengejar target.',
      employment_type: 'Full Time', location: 'Yogyakarta',
      salary_min: 2900000, salary_max: 4500000,
      skills: ['Sales', 'Customer Service', 'Negosiasi', 'Bahasa Inggris Dasar'],
      benefits: ['Komisi Penjualan', 'BPJS Kesehatan', 'BPJS Ketenagakerjaan', 'THR'],
      education_level: 'SMA/SMK', experience_required: 'Fresh Graduate diperbolehkan',
      age_range: '18 - 30 Tahun', status: 'open',
    },
    {
      umkm_id: kriya, title: 'Kurir Pengantar Pesanan',
      description: 'Mengantarkan paket pesanan online ke alamat pelanggan area DIY.\nMemastikan paket sampai dalam kondisi baik dan tepat waktu.',
      requirements: 'Memiliki SIM C aktif dan kendaraan motor pribadi.\nHafal area Yogyakarta dan sekitarnya.',
      employment_type: 'Full Time', location: 'Yogyakarta',
      salary_min: 2800000, salary_max: 3800000,
      skills: ['SIM C', 'Navigasi', 'Tepat Waktu', 'Komunikasi Pelanggan'],
      benefits: ['Uang Bensin', 'Insentif Pengiriman', 'BPJS Kesehatan'],
      education_level: 'SMP/SMA', experience_required: 'Fresh Graduate diperbolehkan',
      age_range: '20 - 40 Tahun', status: 'open',
    },
    {
      umkm_id: kriya, title: 'Pengrajin Kayu (Workshop)',
      description: 'Membuat produk kerajinan kayu sesuai desain dan pesanan.\nMenjaga kualitas hasil akhir produk.',
      requirements: 'Berpengalaman membuat kerajinan kayu minimal 1 tahun.\nMemiliki ketelitian tinggi dan menyukai detail finishing.',
      employment_type: 'Contract', location: 'Yogyakarta',
      salary_min: 3500000, salary_max: 5200000,
      skills: ['Pertukangan', 'Desain Produk', 'Finishing Kayu', 'Detail Oriented'],
      benefits: ['Makan Siang', 'Bonus Proyek', 'Pelatihan Gratis'],
      education_level: 'SMP/SMA', experience_required: '1 Tahun',
      age_range: '20 - 45 Tahun', status: 'open',
    },

    // UMKM Segara Retail — Surabaya, Retail
    {
      umkm_id: segara, title: 'Kasir Shift Sore Cabang Darmo',
      description: 'Melayani transaksi sore hingga malam (14.00 - 22.00).\nMengelola transaksi tunai dan non-tunai.',
      requirements: 'Pendidikan minimal SMA/SMK.\nRamah, cekatan, dan teliti. Bersedia bekerja shift sore.',
      employment_type: 'Full Time', location: 'Surabaya',
      salary_min: 2900000, salary_max: 3700000,
      skills: ['Kasir', 'POS System', 'Customer Service', 'Menghitung Cepat'],
      benefits: ['BPJS Kesehatan', 'Tunjangan Shift Sore', 'Makan Malam'],
      education_level: 'SMA/SMK', experience_required: 'Fresh Graduate diperbolehkan',
      age_range: '18 - 30 Tahun', status: 'open',
    },
    {
      umkm_id: segara, title: 'Staff Display & Penataan Produk',
      description: 'Menata produk di rak sesuai planogram cabang.\nMemastikan label harga akurat dan bersih.',
      requirements: 'Pendidikan minimal SMA/SMK.\nFisik kuat, cekatan, dan terbiasa berdiri lama.',
      employment_type: 'Full Time', location: 'Surabaya',
      salary_min: 2800000, salary_max: 3500000,
      skills: ['Penataan Display', 'Manajemen Stok', 'Operasional Toko', 'Detail'],
      benefits: ['BPJS Kesehatan', 'BPJS Ketenagakerjaan', 'Bonus Bulanan'],
      education_level: 'SMA/SMK', experience_required: 'Fresh Graduate diperbolehkan',
      age_range: '18 - 35 Tahun', status: 'open',
    },
    {
      umkm_id: segara, title: 'Customer Service In-Store',
      description: 'Melayani pertanyaan dan keluhan pelanggan di toko.\nMembantu pelanggan menemukan produk yang dibutuhkan.',
      requirements: 'Pendidikan minimal SMA/SMK.\nKomunikatif, ramah, dan sabar. Bersedia bekerja shift.',
      employment_type: 'Full Time', location: 'Surabaya',
      salary_min: 3000000, salary_max: 4000000,
      skills: ['Customer Service', 'Komunikasi', 'Problem Solving', 'Pelayanan'],
      benefits: ['BPJS Kesehatan', 'Bonus Servis', 'Makan Siang'],
      education_level: 'SMA/SMK', experience_required: 'Fresh Graduate diperbolehkan',
      age_range: '18 - 30 Tahun', status: 'open',
    },
    {
      umkm_id: segara, title: 'Helper Toko (Part Time)',
      description: 'Membantu menata produk di rak toko.\nMembersihkan area toko secara berkala.',
      requirements: 'Sehat jasmani dan kuat fisik.\nRamah dan suka membantu.',
      employment_type: 'Part Time', location: 'Surabaya',
      salary_min: 1500000, salary_max: 2000000,
      skills: ['Tanggap', 'Fisik Kuat', 'Service Minded'],
      benefits: ['Makan Sore', 'Bonus Kehadiran'],
      education_level: 'SMP/SMA', experience_required: 'Fresh Graduate diperbolehkan',
      age_range: '18 - 30 Tahun', status: 'draft',
    },
  ];

  const { data, error } = await supabase.from('jobs').insert(jobs).select('id, title, umkm_id');
  if (error) throw new Error(`Failed to insert jobs: ${error.message}`);
  console.log(`✅ ${data.length} lowongan inserted`);
  return data;
}

async function seedApplicationsAndSaved(ids, jobs) {
  const andi   = ids['worker.andi@binahub.id'];
  const budi   = ids['worker.budi@binahub.id'];
  const citra  = ids['worker.citra@binahub.id'];
  const deni   = ids['worker.deni@binahub.id'];
  const eka    = ids['worker.eka@binahub.id'];
  const fajar  = ids['worker.fajar@binahub.id'];
  const surya  = ids['umkm.surya@binahub.id'];
  const kriya  = ids['umkm.kriya@binahub.id'];
  const segara = ids['umkm.segara@binahub.id'];

  // Map jobs by title for easy lookup
  const byTitle = {};
  jobs.forEach(j => { byTitle[j.title] = j.id; });

  // Job Applications
  const applications = [
    // Bandung workers -> Bandung jobs (Surya)
    { job_id: byTitle['Staff Operasional Toko Pusat'],    worker_id: andi,  cover_letter: 'Saya Andi, pernah bekerja sebagai kasir minimarket dan terbiasa shift. Saya tertarik dengan posisi staff operasional toko ini.', status: 'submitted' },
    { job_id: byTitle['Kasir Outlet Bandung Selatan'],    worker_id: andi,  cover_letter: 'Saya berpengalaman sebagai kasir dan terbiasa transaksi non-tunai. Mohon dipertimbangkan.', status: 'reviewed' },
    { job_id: byTitle['Barista Kafe Cabang Cibaduyut'],   worker_id: budi,  cover_letter: 'Saya tertarik mengembangkan diri sebagai barista. Siap mengikuti pelatihan kopi dari awal.', status: 'submitted' },
    { job_id: byTitle['Staff Operasional Toko Pusat'],    worker_id: budi,  cover_letter: 'Pengalaman menyusun stok gudang akan saya bawa ke posisi staff operasional ini.', status: 'reviewed' },
    // Yogyakarta workers -> Yogyakarta jobs (Kriya)
    { job_id: byTitle['Admin Gudang Workshop'],           worker_id: citra, cover_letter: 'Saya Citra, terbiasa input data harian dan laporan. Excel saya cukup baik untuk laporan stok.', status: 'accepted' },
    { job_id: byTitle['Sales Counter Galeri Souvenir'],   worker_id: citra, cover_letter: 'Saya senang berinteraksi dengan pelanggan dan ingin mencoba bidang sales.', status: 'submitted' },
    { job_id: byTitle['Kurir Pengantar Pesanan'],         worker_id: deni,  cover_letter: 'Saya pernah jadi kurir internal UMKM, hafal jalan Yogya, punya SIM C aktif.', status: 'accepted' },
    { job_id: byTitle['Sales Counter Galeri Souvenir'],   worker_id: deni,  cover_letter: 'Pengalaman melayani pelanggan saya akan membantu meraih target penjualan.', status: 'reviewed' },
    // Surabaya workers -> Surabaya jobs (Segara)
    { job_id: byTitle['Staff Display & Penataan Produk'], worker_id: eka,   cover_letter: 'Saya berpengalaman 2 tahun di toko retail, terbiasa menata display dan mengelola stok.', status: 'accepted' },
    { job_id: byTitle['Customer Service In-Store'],       worker_id: eka,   cover_letter: 'Pengalaman saya melayani pelanggan retail siap saya bawa ke posisi customer service.', status: 'submitted' },
    { job_id: byTitle['Kasir Shift Sore Cabang Darmo'],   worker_id: fajar, cover_letter: 'Saya Fajar, terbiasa menangani transaksi harian. Bersedia shift sore sesuai kebutuhan.', status: 'submitted' },
    { job_id: byTitle['Customer Service In-Store'],       worker_id: fajar, cover_letter: 'Pengalaman saya di pelayanan pelanggan akan menjadi nilai tambah untuk posisi ini.', status: 'reviewed' },
  ];

  const { error: appError } = await supabase.from('job_applications').insert(applications);
  if (appError) throw new Error(`Failed to insert applications: ${appError.message}`);
  console.log(`✅ ${applications.length} job applications inserted`);

  // Saved Jobs
  const savedJobs = [
    { job_id: byTitle['Barista Kafe Cabang Cibaduyut'],   worker_id: andi  },
    { job_id: byTitle['Helper Dapur (Part Time)'],        worker_id: andi  },
    { job_id: byTitle['Barista Kafe Cabang Cibaduyut'],   worker_id: budi  },
    { job_id: byTitle['Kurir Pengantar Pesanan'],         worker_id: citra },
    { job_id: byTitle['Pengrajin Kayu (Workshop)'],       worker_id: citra },
    { job_id: byTitle['Admin Gudang Workshop'],           worker_id: deni  },
    { job_id: byTitle['Kasir Shift Sore Cabang Darmo'],   worker_id: eka   },
    { job_id: byTitle['Staff Display & Penataan Produk'], worker_id: fajar },
  ];

  const { error: savedError } = await supabase.from('saved_jobs').insert(savedJobs);
  if (savedError) throw new Error(`Failed to insert saved jobs: ${savedError.message}`);
  console.log(`✅ ${savedJobs.length} saved jobs inserted`);
}

async function main() {
  console.log('🌱 Starting lowongan seed...\n');

  const ids = await getUserIds();
  console.log(`✅ Found ${Object.keys(ids).length} users\n`);

  await cleanExisting(ids);
  const jobs = await seedJobs(ids);
  await seedApplicationsAndSaved(ids, jobs);

  console.log('\n🎉 Lowongan seed completed!');
  console.log('\n📊 Summary:');
  console.log('   12 lowongan (4 per UMKM)');
  console.log('   12 job applications (status: submitted/reviewed/accepted)');
  console.log('   8 saved jobs (worker bookmarks)');
  console.log('\n🚀 Login dan test di http://localhost:3000');
}

main().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});

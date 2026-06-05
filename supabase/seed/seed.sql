INSERT INTO users (email, password_hash, full_name, role, is_verified)
VALUES
    ('admin@binahub.id', 'demo-hash-admin', 'Admin BinaHub', 'admin', TRUE),
    ('umkm@binahub.id', 'demo-hash-umkm', 'UMKM Sejahtera', 'umkm', TRUE),
    ('worker@binahub.id', 'demo-hash-worker', 'Pekerja Binaan', 'worker', TRUE);

INSERT INTO umkm_profiles (user_id, business_name, business_sector, city, province, business_address, company_description)
SELECT id, 'UMKM Sejahtera', 'Kuliner', 'Bandung', 'Jawa Barat', 'Jl. Merdeka No. 10, Bandung', 'UMKM yang membuka peluang kerja inklusif.'
FROM users
WHERE email = 'umkm@binahub.id';

INSERT INTO worker_profiles (user_id, birth_date, city, province, skills, education_level, rehabilitation_program, experience_summary, status)
SELECT id, '1998-07-21', 'Bandung', 'Jawa Barat', 'Operasional Gudang, Customer Service', 'SMA', 'Program Pembinaan Keterampilan Kerja', 'Pernah bekerja sebagai staff gudang selama 2 tahun.', 'active'
FROM users
WHERE email = 'worker@binahub.id';

INSERT INTO jobs (umkm_id, title, description, requirements, employment_type, location, salary_min, salary_max, status, published_at)
SELECT id,
       'Staff Operasional Toko',
       'Mengelola stok, membantu operasional harian, dan melayani pelanggan.',
       'Disiplin, komunikatif, siap bekerja shift.',
       'full-time',
       'Bandung',
       2500000,
       3500000,
       'open',
       NOW()
FROM users
WHERE email = 'umkm@binahub.id';

INSERT INTO job_applications (job_id, worker_id, cover_letter, status)
SELECT j.id, w.id, 'Saya siap bekerja dan berkembang bersama UMKM.', 'accepted'
FROM jobs j
JOIN users w ON w.email = 'worker@binahub.id'
WHERE j.title = 'Staff Operasional Toko';

INSERT INTO placements (job_id, worker_id, umkm_id, application_id, start_date, status, notes)
SELECT j.id, w.id, u.id, a.id, CURRENT_DATE - INTERVAL '7 days', 'active', 'Penempatan awal berjalan baik.'
FROM jobs j
JOIN users w ON w.email = 'worker@binahub.id'
JOIN users u ON u.email = 'umkm@binahub.id'
JOIN job_applications a ON a.job_id = j.id AND a.worker_id = w.id
WHERE j.title = 'Staff Operasional Toko';

INSERT INTO checkins (worker_id, placement_id, channel, content, sentiment_score)
SELECT w.id, p.id, 'text', 'Hari ini saya cukup baik, tetapi sedikit cemas terkait target kerja.', 0.15
FROM users w
JOIN placements p ON p.worker_id = w.id
WHERE w.email = 'worker@binahub.id';

INSERT INTO risk_assessments (worker_id, placement_id, checkin_id, risk_level, risk_score, trigger_reason, recommendation, model_name)
SELECT w.id, p.id, c.id, 'yellow', 58.30,
       'Terdapat kata-kata yang menunjukkan kecemasan ringan.',
       'Lakukan sesi pendampingan singkat dan monitoring 3 hari ke depan.',
       'azure-openai-gpt'
FROM users w
JOIN placements p ON p.worker_id = w.id
JOIN checkins c ON c.worker_id = w.id
WHERE w.email = 'worker@binahub.id'
ORDER BY c.submitted_at DESC
LIMIT 1;

INSERT INTO alerts (umkm_id, worker_id, placement_id, risk_assessment_id, title, message, status)
SELECT u.id, w.id, p.id, r.id,
       'Peringatan Risiko Kuning',
       'Pekerja menunjukkan kecemasan ringan. Disarankan pendampingan dan pemantauan.',
       'unread'
FROM users u
JOIN users w ON w.email = 'worker@binahub.id'
JOIN placements p ON p.worker_id = w.id
JOIN risk_assessments r ON r.worker_id = w.id
WHERE u.email = 'umkm@binahub.id'
ORDER BY r.assessed_at DESC
LIMIT 1;

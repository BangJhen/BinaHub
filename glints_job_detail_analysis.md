# 📋 Analisis Detail Halaman Lowongan Kerja Glints

## 📑 Daftar Isi
1. [Struktur Umum Halaman](#struktur-umum)
2. [Breakdown Section](#breakdown-section)
3. [Data & Field Details](#data--field-details)
4. [Implementasi Code](#implementasi-code)
5. [Component Architecture](#component-architecture)

---

## Struktur Umum

### Layout Halaman
Halaman detail lowongan Glints menggunakan **layout 2 kolom**:
- **Kolom Kiri (Main Content)**: Informasi detail lowongan
- **Kolom Kanan (Sidebar)**: Related Jobs & Quick Apply

```
┌─────────────────────────────────────────────────────┐
│                    HEADER / NAVBAR                   │
├──────────────────────────┬──────────────────────────┤
│                          │                          │
│   MAIN CONTENT          │    SIDEBAR (Right)       │
│   (70% width)           │    (30% width)           │
│                          │                          │
│  ├─ Header Section      │  ├─ QR Code Box         │
│  ├─ Basic Info          │  ├─ Related Jobs        │
│  ├─ Action Buttons      │  │  - Job Cards         │
│  ├─ Quick Summary       │  │  - Salary            │
│  ├─ Skills             │  │  - Location           │
│  ├─ Benefits           │  │  - Posted Time        │
│  ├─ Recruiter Info     │  │                       │
│  ├─ Job Description    │  │                       │
│  ├─ Company Info       │  │                       │
│  └─ Tips               │  └─ Safety Tips         │
│                          │                          │
└──────────────────────────┴──────────────────────────┘
```

---

## Breakdown Section

### 1️⃣ HEADER SECTION

#### A. Judul & Perusahaan
```
Title: "SALES GENERALIS BANK MANDIRI PEMATANGSIANTAR MEGALAND"
Company: "PT Puriasri Bhaktikarya"
Company Badge: ✓ (Verified)
```

**Properties:**
- Judul pekerjaan: Bold, ukuran besar (24-32px)
- Nama perusahaan: Medium size (16-18px)
- Badge verifikasi: Green checkmark icon

#### B. Informasi Cepat (Quick Info Strip)
Ditampilkan dalam bentuk **icon + text** secara horizontal:

| Icon | Field | Value |
|------|-------|-------|
| 💰 | Salary | Not specified / Perusahaan tidak menampilkan gaji |
| 🏢 | Tipe Perusahaan | Business Development & Sales, Sales Representative |
| 📍 | Lokasi Kerja | Kontrak - Kerja di lokasi |
| 📚 | Pendidikan | Minimal Diploma (D1 - D4) |
| ⏱️ | Pengalaman | 1 - 3 tahun pengalaman |
| ⏰ | Update | Tayang 2 hari yang lalu - Diperbaharui 2 hari yang lalu |

**Styling:**
- Setiap item dalam container horizontal
- Icon size: 20-24px
- Text size: 14px
- Spacing antar item: 16px

---

### 2️⃣ ACTION BUTTONS SECTION

Dua tombol utama berwarna berbeda:

#### Button 1: "LAMAR & CHAT DI APLIKASI" (Primary)
- **Background Color**: Blue (#0052CC atau similar)
- **Text Color**: White
- **Icon**: 📱 (aplikasi icon)
- **Action**: Link ke aplikasi Glints untuk apply
- **Size**: Large button, full width atau semi-wide
- **Hover Effect**: Darker blue atau shadow

#### Button 2: "LAMAR" (Secondary)
- **Background Color**: White/Transparent
- **Border**: Blue border
- **Text Color**: Blue
- **Action**: Direct apply di web
- **Size**: Same height as button 1

#### Additional Icons:
- **Bookmark Icon**: ⭐ (Save job)
- **Share Icon**: 🔗 (Share to social media)

---

### 3️⃣ PERSYARATAN SECTION (Quick Summary Table)

Menampilkan 4 kolom informasi penting:

```
┌─────────────────┬─────────────────┬─────────────────┬──────────────────┐
│ Kerja di lokasi │ 1 - 3 tahun     │ Minimal Diploma │ 20-34 tahun      │
│                 │ pengalaman       │ (D1 - D4)       │                  │
└─────────────────┴─────────────────┴─────────────────┴──────────────────┘
```

**Fields:**
1. **Lokasi Kerja**: Tipe kontrak / lokasi kerja
2. **Pengalaman**: Tahun pengalaman yang dibutuhkan
3. **Pendidikan**: Level pendidikan minimum
4. **Usia**: Range usia yang diharapkan (optional)

**Styling:**
- Background: Light gray (#F5F5F5)
- Border: Subtle gray border
- Padding: 16px
- Font weight: Semibold untuk value, regular untuk label

---

### 4️⃣ SKILLS SECTION

**Title**: "Skills" dengan info icon (?)

**Display Format**: Tag-based (pill shapes)

**Skills Listed:**
```
[telesales] [Customer Engagement] [Customer Service] [Communication Skills]
[B2C Sales] [Sales and Marketing] [Customer Relationship Management]
[Sales Management] [Sales Strategy] [B2B Sales]
```

**Properties:**
- Background: Light blue (#E8F4F8)
- Text Color: Dark blue (#0052CC)
- Border: None
- Border-radius: 20px (rounded pill)
- Padding: 8px 12px
- Margin: 8px 4px
- Font size: 13-14px
- Cursor: Pointer (hover effect mungkin ada)

**Layout:**
- Flex wrap (wrap to next line)
- Gap: 8px

---

### 5️⃣ BENEFIT KERJA SECTION

**Title**: "Benefit Kerja"

**Benefits Displayed**: Horizontal tag format (sama seperti skills)

```
[Health Insurance] [THR] [Work Insurance] [Annual Leave]
```

**Styling**: Same as skills section

---

### 6️⃣ LOKER INI DIKELOLA OLEH SECTION

**Content:**
- Avatar: Placeholder dengan inisial "MF"
- Name: "Muhammad Faza Al Farisi"
- Badge: "Perusahaan Premium" (orange/yellow badge)
- Status: "Online 2 jam yang lalu"
- Link: Underlined text (clickable)

**Avatar Styling:**
- Size: 48px x 48px
- Background: Light blue
- Font weight: Bold
- Border-radius: 50% (circular)

**Badge Styling:**
- Background: Orange/Yellow (#FFA500 atau #FFC107)
- Text Color: Dark / Black
- Border-radius: 4px
- Padding: 4px 8px
- Font size: 12px

---

### 7️⃣ DESKRIPSI PEKERJAAN SECTION (Main Content)

**Title**: "Deskripsi pekerjaan SALES GENERALIS BANK MANDIRI PEMATANGSIANTAR MEGALAND PT Puriasri Bhaktikarya"

**Format**: Unordered list (bullet points)

**Content** (dari screenshot):
- IPK Minimal 2.75
- Pendidikan minimal D3
- Penempatan Pematangsiantar Megaland
- Memiliki kendaraan bermotor dan SIM
- Menawarkan produk kredit konsumtif atau produktif kepada calon nasabah sesuai target yang ditentukan
- Membangun dan menjaga hubungan baik dengan nasabah serta jaringan mitra di lapangan
- Melakukan survei kelayakan calon debitur dan mengumpulkan dokumen pendukung pengajuan kredit
- Melaporkan progres penjualan dan pencapaian target secara berkala kepada supervisor
- Memastikan kepuasan terhadap prosedur dan kebijakan bank dalam proses penjualan dan seleksi nasabah

**Styling:**
- Font size: 14-16px
- Line height: 1.6
- Color: Dark gray (#333333)
- List style: Standard bullet points (•)
- Padding left: 20px untuk bullets
- Margin bottom per item: 12px

---

### 8️⃣ TENTANG PERUSAHAAN SECTION

**Container**: White box dengan border subtle

**Content:**

#### Company Header
- **Logo**: Small company logo (64px x 64px)
- **Name**: "PT Puriasri Bhaktikarya" (linked)
- **Industry**: "Outsourcing/Offshoring"
- **Size**: "1001 - 5000 karyawan"
- **Social Icons**: Website, LinkedIn, Instagram (links)

#### Company Description
**Text Format**: Short paragraph dengan "Lihat Lebih Banyak" (expand) link

```
"PT Puriasri Bhaktikarya adalah perusahaan nasional yang bergerak di bidang jasa alih daya 
(outsourcing), payroll service, dan building management sejak tahun 1992. Kami menyediakan 
tenaga kerja profesional untuk berbagai sektor, termasuk perbankan, administrasi, keamanan, 
marketing, call center, serta layanan kebersihan dan manajemen gedung....."
```

**Styling:**
- Font size: 14px
- Line height: 1.6
- Color: #555555
- Margin: 12px 0

#### Alamat Kantor
- **Label**: "Alamat kantor"
- **Value**: "Jalan Bunga Mawar Nomor 7, Kelurahan Cipete Selatan Kecamatan Cilandak"

#### Galeri Perusahaan
- **Title**: "Galeri Perusahaan"
- **Display**: Grid of company images/photos
- **Image Size**: 100px x 100px (thumbnail)

---

### 9️⃣ RIGHT SIDEBAR - QR CODE & RELATED JOBS

#### A. QR Code Box
- **Title**: "Dapatkan konfirmasi interview secara langsung di Aplikasi Glints"
- **Subtitle**: "scan kode QR untuk download"
- **QR Code**: Large, centered
- **Border**: Blue border/outline

#### B. Related Jobs Section
**Title**: "Lowongan Lainnya Untukmu"

**Job Card Template** (Repeating):
```
┌─────────────────────────────────────┐
│ Job Title                 [Salary]  │
│ [Contract Type] [Duration] [Level]  │
│ [Company Badge]                     │
│ ✓ Company Name                      │
│ 📍 Location                         │
│ ⏱️ Posted X days/hours ago          │
│ [Bookmark Icon]                     │
└─────────────────────────────────────┘
```

**Job Card Fields:**

| Field | Details |
|-------|---------|
| Job Title | Bold, 14-16px |
| Salary | Rp 3 jt-5 jt (right aligned) |
| Contract Type | "Kontrak", "1-3 tahun", etc. |
| Education Level | "Minimal SMA/SMK" |
| Company Badge | Green checkmark if verified |
| Company Name | Blue text (linked) |
| Location | With pin icon |
| Posted Time | Gray text, smaller font |
| Bookmark Icon | Top right corner |

**Example Jobs from Screenshot:**
1. **Sales Assistant** - Rp 3 jt-5 jt
2. **Medical Representatif** - Rp 2.5 jt-5 jt (Premium)
3. **Credit Marketing Officer** - Rp 3.5 jt-4 jt
4. **Team Leader** - Rp 3.5 jt-5 jt

---

### 🔟 FOOTER - TIPS & SAFETY

#### Tips Aman Cari Kerja
- **Icon**: Alert/Info icon
- **Title**: "Tips Aman Cari Kerja"
- **Content**: Helpful tips text
- **Text**: "Pemberi kerja yang benar tidak akan meminta uang apapun dalam bentuk apapun. Jangan berikan kontak pribadi, informasi: bank, maupun kartu kredit kamu."

**Styling:**
- Background: Light yellow/cream (#FFFBEA)
- Border left: Orange border (3px)
- Padding: 16px
- Border-radius: 4px

---

## Data & Field Details

### Data Structure

```javascript
// Job Detail Object
const jobDetail = {
  // Header
  id: "0dedb326-fec4-4460-82b5-a4ddc45f7481",
  title: "SALES GENERALIS BANK MANDIRI PEMATANGSIANTAR MEGALAND",
  company: {
    id: "company_123",
    name: "PT Puriasri Bhaktikarya",
    verified: true,
    logo: "url_to_logo"
  },
  
  // Basic Info
  salary: {
    min: null,
    max: null,
    currency: "IDR",
    display: "Perusahaan tidak menampilkan gaji"
  },
  jobType: {
    category: "Business Development & Sales",
    position: "Sales Representative"
  },
  location: {
    workType: "Kontrak - Kerja di lokasi",
    city: "Pematangsiantar",
    province: "Sumatera Utara",
    address: "Megaland"
  },
  education: {
    level: "Diploma (D1 - D4)",
    minGPA: 2.75
  },
  experience: {
    min: 1,
    max: 3,
    unit: "tahun"
  },
  ageRange: {
    min: 20,
    max: 34
  },
  postedDate: "2 hari yang lalu",
  updatedDate: "2 hari yang lalu",
  
  // Skills
  skills: [
    "telesales",
    "Customer Engagement",
    "Customer Service",
    "Communication Skills",
    "B2C Sales",
    "Sales and Marketing",
    "Customer Relationship Management",
    "Sales Management",
    "Sales Strategy",
    "B2B Sales"
  ],
  
  // Benefits
  benefits: [
    "Health Insurance",
    "THR",
    "Work Insurance",
    "Annual Leave"
  ],
  
  // Description
  description: "IPK Minimal 2.75\nPendidikan minimal D3\n...",
  descriptionBullets: [
    "IPK Minimal 2.75",
    "Pendidikan minimal D3",
    "Penempatan Pematangsiantar Megaland",
    // ... more items
  ],
  
  // Recruiter
  recruiter: {
    id: "recruiter_123",
    name: "Muhammad Faza Al Farisi",
    avatar: "MF",
    isPremium: true,
    lastOnline: "2 jam yang lalu"
  },
  
  // Company Details
  companyDetails: {
    industry: "Outsourcing/Offshoring",
    size: "1001 - 5000 karyawan",
    description: "PT Puriasri Bhaktikarya adalah perusahaan nasional...",
    address: "Jalan Bunga Mawar Nomor 7, Kelurahan Cipete Selatan Kecamatan Cilandak",
    website: "url",
    linkedin: "url",
    instagram: "url"
  }
}
```

---

## Implementasi Code

### 1. React Component Structure

#### A. Main Job Detail Component

```jsx
import React, { useState } from 'react';
import './JobDetail.css';
import { 
  Header, 
  ActionButtons, 
  QuickSummary, 
  Skills, 
  Benefits, 
  RecruiterCard, 
  Description, 
  CompanyInfo, 
  SafetyTips,
  RelatedJobs,
  QRCodeBox
} from './components';

export default function JobDetail({ jobId }) {
  const [isSaved, setIsSaved] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Fetch job detail from API
    fetchJobDetail(jobId).then(data => {
      setJobData(data);
      setLoading(false);
    });
  }, [jobId]);

  if (loading) return <div>Loading...</div>;
  if (!jobData) return <div>Job not found</div>;

  return (
    <div className="job-detail-container">
      {/* Main Content */}
      <div className="main-content">
        <Header company={jobData.company} jobTitle={jobData.title} />
        
        <QuickInfoStrip job={jobData} />
        
        <ActionButtons 
          jobId={jobId}
          isSaved={isSaved}
          onSave={() => setIsSaved(!isSaved)}
        />
        
        <QuickSummary 
          experience={jobData.experience}
          education={jobData.education}
          location={jobData.location}
          ageRange={jobData.ageRange}
        />
        
        <Skills skills={jobData.skills} />
        
        <Benefits benefits={jobData.benefits} />
        
        <RecruiterCard recruiter={jobData.recruiter} />
        
        <Description 
          title={jobData.title}
          company={jobData.company.name}
          bullets={jobData.descriptionBullets}
        />
        
        <CompanyInfo company={jobData.companyDetails} />
        
        <SafetyTips />
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <QRCodeBox />
        <RelatedJobs jobs={jobData.relatedJobs} />
      </aside>
    </div>
  );
}
```

#### B. Header Component

```jsx
export function Header({ company, jobTitle }) {
  return (
    <div className="header-section">
      <div className="header-top">
        <img 
          src={company.logo} 
          alt={company.name}
          className="company-logo"
        />
        <div className="header-info">
          <h1 className="job-title">{jobTitle}</h1>
          <div className="company-name-badge">
            <span className="verified-badge">✓</span>
            <span className="company-name">{company.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### C. Quick Info Strip Component

```jsx
export function QuickInfoStrip({ job }) {
  const infoItems = [
    {
      icon: '💰',
      label: 'Salary',
      value: job.salary.display
    },
    {
      icon: '🏢',
      label: 'Type',
      value: `${job.jobType.category} - ${job.jobType.position}`
    },
    {
      icon: '📍',
      label: 'Location',
      value: job.location.workType
    },
    {
      icon: '📚',
      label: 'Education',
      value: job.education.level
    },
    {
      icon: '⏱️',
      label: 'Experience',
      value: `${job.experience.min} - ${job.experience.max} tahun`
    },
    {
      icon: '⏰',
      label: 'Posted',
      value: job.postedDate
    }
  ];

  return (
    <div className="quick-info-strip">
      {infoItems.map((item, index) => (
        <div key={index} className="info-item">
          <span className="info-icon">{item.icon}</span>
          <div className="info-content">
            <span className="info-label">{item.label}</span>
            <span className="info-value">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### D. Action Buttons Component

```jsx
export function ActionButtons({ jobId, isSaved, onSave }) {
  return (
    <div className="action-buttons">
      <button className="btn-primary btn-apply">
        📱 LAMAR & CHAT DI APLIKASI
      </button>
      <button className="btn-secondary btn-apply-web">
        LAMAR
      </button>
      <button 
        className={`btn-icon btn-save ${isSaved ? 'saved' : ''}`}
        onClick={onSave}
        title={isSaved ? "Hapus dari saved" : "Simpan pekerjaan"}
      >
        {isSaved ? '⭐' : '☆'}
      </button>
      <button className="btn-icon btn-share" title="Bagikan">
        🔗
      </button>
    </div>
  );
}
```

#### E. Quick Summary Component

```jsx
export function QuickSummary({ experience, education, location, ageRange }) {
  return (
    <div className="quick-summary">
      <div className="summary-item">
        <span className="summary-label">Kerja di lokasi</span>
        <span className="summary-value">{location.workType}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Pengalaman</span>
        <span className="summary-value">
          {experience.min} - {experience.max} tahun
        </span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Pendidikan</span>
        <span className="summary-value">{education.level}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Usia</span>
        <span className="summary-value">
          {ageRange.min}-{ageRange.max} tahun
        </span>
      </div>
    </div>
  );
}
```

#### F. Skills Component

```jsx
export function Skills({ skills }) {
  return (
    <div className="skills-section">
      <h3 className="section-title">
        Skills <span className="info-icon" title="Required skills">ℹ️</span>
      </h3>
      <div className="skills-container">
        {skills.map((skill, index) => (
          <span key={index} className="skill-tag">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
```

#### G. Benefits Component

```jsx
export function Benefits({ benefits }) {
  return (
    <div className="benefits-section">
      <h3 className="section-title">Benefit Kerja</h3>
      <div className="benefits-container">
        {benefits.map((benefit, index) => (
          <span key={index} className="benefit-tag">
            {benefit}
          </span>
        ))}
      </div>
    </div>
  );
}
```

#### H. Description Component

```jsx
export function Description({ title, company, bullets }) {
  return (
    <div className="description-section">
      <h3 className="section-title">
        Deskripsi pekerjaan {title} {company}
      </h3>
      <ul className="description-list">
        {bullets.map((bullet, index) => (
          <li key={index} className="description-item">
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### I. Company Info Component

```jsx
export function CompanyInfo({ company }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="company-info-section">
      <div className="company-info-header">
        <img 
          src={company.logo} 
          alt={company.name}
          className="company-logo-small"
        />
        <div className="company-header-info">
          <a href={`/company/${company.id}`} className="company-name-link">
            {company.name}
          </a>
          <p className="company-type">{company.industry}</p>
          <p className="company-size">{company.size}</p>
          <div className="company-social">
            <a href={company.website} target="_blank" rel="noopener noreferrer">🌐</a>
            <a href={company.linkedin} target="_blank" rel="noopener noreferrer">💼</a>
            <a href={company.instagram} target="_blank" rel="noopener noreferrer">📷</a>
          </div>
        </div>
      </div>

      <div className="company-description">
        <p className={`description-text ${expanded ? 'expanded' : ''}`}>
          {company.description}
        </p>
        <button 
          className="btn-expand"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Lihat Lebih Sedikit' : 'Lihat Lebih Banyak'}
        </button>
      </div>

      <div className="company-address">
        <h4>Alamat kantor</h4>
        <p>{company.address}</p>
      </div>

      {company.gallery && (
        <div className="company-gallery">
          <h4>Galeri Perusahaan</h4>
          <div className="gallery-grid">
            {company.gallery.map((image, index) => (
              <img 
                key={index}
                src={image}
                alt={`Company ${index}`}
                className="gallery-image"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### J. Recruiter Card Component

```jsx
export function RecruiterCard({ recruiter }) {
  return (
    <div className="recruiter-section">
      <h3 className="section-title">Loker ini dikelola oleh</h3>
      <div className="recruiter-card">
        <div className="recruiter-avatar">
          {recruiter.avatar}
        </div>
        <div className="recruiter-info">
          <a href={`/recruiter/${recruiter.id}`} className="recruiter-name">
            {recruiter.name}
          </a>
          {recruiter.isPremium && (
            <span className="premium-badge">Perusahaan Premium</span>
          )}
          <p className="recruiter-status">Online {recruiter.lastOnline}</p>
        </div>
      </div>
    </div>
  );
}
```

#### K. Safety Tips Component

```jsx
export function SafetyTips() {
  return (
    <div className="safety-tips">
      <div className="safety-header">
        <span className="safety-icon">⚠️</span>
        <h4>Tips Aman Cari Kerja</h4>
      </div>
      <p className="safety-text">
        Pemberi kerja yang benar tidak akan meminta uang apapun dalam bentuk apapun. 
        Jangan berikan kontak pribadi, informasi: bank, maupun kartu kredit kamu.
      </p>
    </div>
  );
}
```

#### L. Related Jobs Component (Sidebar)

```jsx
export function RelatedJobs({ jobs }) {
  return (
    <div className="related-jobs-section">
      <h3 className="section-title">Lowongan Lainnya Untukmu</h3>
      <div className="jobs-list">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

function JobCard({ job }) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <a href={`/job/${job.id}`} className="job-card">
      <div className="job-card-header">
        <h4 className="job-card-title">{job.title}</h4>
        {job.salary && (
          <span className="job-card-salary">{job.salary}</span>
        )}
      </div>

      <div className="job-card-meta">
        {job.contractType && (
          <span className="job-meta-item">{job.contractType}</span>
        )}
        {job.duration && (
          <span className="job-meta-item">{job.duration}</span>
        )}
        {job.educationLevel && (
          <span className="job-meta-item">{job.educationLevel}</span>
        )}
      </div>

      {job.isPremium && (
        <span className="premium-badge">Perusahaan Premium</span>
      )}

      <div className="job-card-company">
        {job.companyVerified && <span className="verified-badge">✓</span>}
        <span className="company-name">{job.companyName}</span>
      </div>

      <div className="job-card-location">
        📍 {job.location}
      </div>

      <div className="job-card-footer">
        <span className="posted-time">⏱️ {job.postedTime}</span>
        <button 
          className={`btn-save-card ${isSaved ? 'saved' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setIsSaved(!isSaved);
          }}
        >
          {isSaved ? '⭐' : '☆'}
        </button>
      </div>
    </a>
  );
}
```

---

### 2. CSS Styling

```css
/* ===== MAIN CONTAINER ===== */
.job-detail-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: #fafafa;
}

@media (max-width: 992px) {
  .job-detail-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: sticky;
    top: 100px;
  }
}

/* ===== HEADER SECTION ===== */
.header-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-top {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.company-logo {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.header-info {
  flex: 1;
}

.job-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #1a1a1a;
  line-height: 1.3;
}

.company-name-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.verified-badge {
  color: #00b050;
  font-size: 16px;
}

.company-name {
  font-size: 16px;
  font-weight: 500;
  color: #0052cc;
  text-decoration: none;
  cursor: pointer;
}

/* ===== QUICK INFO STRIP ===== */
.quick-info-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.info-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
}

.info-value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
  margin-top: 4px;
}

/* ===== ACTION BUTTONS ===== */
.action-buttons {
  display: flex;
  gap: 12px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.btn-apply {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #0052cc;
  color: white;
  flex: 1;
  min-width: 200px;
}

.btn-primary:hover {
  background: #0047b2;
  box-shadow: 0 2px 8px rgba(0, 82, 204, 0.3);
}

.btn-secondary {
  background: white;
  color: #0052cc;
  border: 2px solid #0052cc;
  flex: 0 1 auto;
}

.btn-secondary:hover {
  background: #f0f4ff;
}

.btn-icon {
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  border-color: #0052cc;
  color: #0052cc;
  background: #f0f4ff;
}

.btn-save.saved {
  background: #fff3cd;
  border-color: #ffc107;
  color: #ffc107;
}

/* ===== QUICK SUMMARY TABLE ===== */
.quick-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

@media (max-width: 768px) {
  .quick-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

/* ===== SKILLS & BENEFITS SECTIONS ===== */
.skills-section,
.benefits-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  font-size: 14px;
  color: #999;
  cursor: help;
}

.skills-container,
.benefits-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag,
.benefit-tag {
  display: inline-block;
  background: #e8f4f8;
  color: #0052cc;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skill-tag:hover,
.benefit-tag:hover {
  background: #d0e8f0;
}

/* ===== RECRUITER SECTION ===== */
.recruiter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.recruiter-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.recruiter-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #0052cc;
  font-size: 18px;
  flex-shrink: 0;
}

.recruiter-info {
  flex: 1;
}

.recruiter-name {
  font-size: 14px;
  font-weight: 600;
  color: #0052cc;
  text-decoration: none;
  cursor: pointer;
  display: block;
  margin-bottom: 4px;
}

.recruiter-name:hover {
  text-decoration: underline;
}

.premium-badge {
  display: inline-block;
  background: #ffc107;
  color: #1a1a1a;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
}

.recruiter-status {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* ===== DESCRIPTION SECTION ===== */
.description-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.description-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.description-item {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
  padding-left: 20px;
  position: relative;
}

.description-item::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #0052cc;
  font-weight: bold;
}

/* ===== COMPANY INFO SECTION ===== */
.company-info-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.company-info-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.company-logo-small {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.company-header-info {
  flex: 1;
}

.company-name-link {
  font-size: 16px;
  font-weight: 600;
  color: #0052cc;
  text-decoration: none;
  display: block;
  margin-bottom: 4px;
}

.company-name-link:hover {
  text-decoration: underline;
}

.company-type {
  font-size: 13px;
  color: #666;
  margin: 0 0 4px 0;
}

.company-size {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px 0;
}

.company-social {
  display: flex;
  gap: 12px;
}

.company-social a {
  font-size: 18px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.company-social a:hover {
  transform: scale(1.2);
}

.company-description {
  margin-bottom: 20px;
}

.description-text {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.description-text.expanded {
  display: block;
  -webkit-line-clamp: unset;
}

.btn-expand {
  background: none;
  border: none;
  color: #0052cc;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.btn-expand:hover {
  text-decoration: none;
}

.company-address h4,
.company-gallery h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1a1a1a;
}

.company-address p {
  font-size: 14px;
  color: #555;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.gallery-image {
  width: 100%;
  height: 100px;
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-image:hover {
  transform: scale(1.05);
}

/* ===== SAFETY TIPS ===== */
.safety-tips {
  background: #fffbea;
  border-left: 4px solid #ffc107;
  padding: 16px;
  border-radius: 4px;
  margin-top: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.safety-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.safety-icon {
  font-size: 18px;
}

.safety-header h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.safety-text {
  font-size: 13px;
  line-height: 1.5;
  color: #555;
  margin: 0;
}

/* ===== SIDEBAR ===== */
.sidebar {
  position: relative;
}

.qr-code-box {
  background: white;
  border: 2px solid #0052cc;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.qr-code-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.qr-code-subtitle {
  font-size: 11px;
  color: #666;
  margin: 0 0 12px 0;
}

.qr-code-image {
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

/* ===== RELATED JOBS ===== */
.related-jobs-section {
  background: white;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.related-jobs-section .section-title {
  padding: 16px 16px 0 16px;
}

.jobs-list {
  display: flex;
  flex-direction: column;
}

.job-card {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  text-decoration: none;
  color: inherit;
  transition: background 0.3s ease;
  cursor: pointer;
  display: block;
  position: relative;
}

.job-card:last-child {
  border-bottom: none;
}

.job-card:hover {
  background: #f9f9f9;
}

.job-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;
}

.job-card-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
  line-height: 1.3;
  flex: 1;
}

.job-card-salary {
  font-size: 12px;
  font-weight: 600;
  color: #0052cc;
  white-space: nowrap;
}

.job-card-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.job-meta-item {
  font-size: 11px;
  color: #999;
  background: #f5f5f5;
  padding: 3px 8px;
  border-radius: 3px;
}

.job-card-company {
  font-size: 12px;
  color: #0052cc;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.job-card-location {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.job-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.posted-time {
  font-size: 11px;
  color: #999;
}

.btn-save-card {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.btn-save-card.saved {
  color: #ffc107;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .job-detail-container {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }

  .quick-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-info-strip {
    grid-template-columns: repeat(2, 1fr);
  }

  .job-title {
    font-size: 20px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-apply {
    width: 100%;
    min-width: auto;
  }

  .company-info-header {
    flex-direction: column;
    text-align: center;
  }

  .company-logo-small {
    margin: 0 auto;
  }

  .company-social {
    justify-content: center;
  }
}
```

---

### 3. Data API Response Example

```json
{
  "status": "success",
  "data": {
    "id": "0dedb326-fec4-4460-82b5-a4ddc45f7481",
    "title": "SALES GENERALIS BANK MANDIRI PEMATANGSIANTAR MEGALAND",
    "slug": "sales-generalis-bank-mandiri-pematangsiantar-megaland",
    "company": {
      "id": "company_001",
      "name": "PT Puriasri Bhaktikarya",
      "verified": true,
      "logo": "https://...",
      "industry": "Outsourcing/Offshoring",
      "size": "1001 - 5000 karyawan",
      "description": "PT Puriasri Bhaktikarya adalah perusahaan nasional...",
      "address": "Jalan Bunga Mawar Nomor 7, Kelurahan Cipete Selatan Kecamatan Cilandak",
      "website": "https://puriasri.co.id",
      "linkedin": "https://linkedin.com/company/puriasri",
      "instagram": "https://instagram.com/puriasri",
      "gallery": ["url1", "url2", "url3"]
    },
    "salary": {
      "min": null,
      "max": null,
      "currency": "IDR",
      "display": "Perusahaan tidak menampilkan gaji"
    },
    "jobType": {
      "category": "Business Development & Sales",
      "position": "Sales Representative"
    },
    "location": {
      "workType": "Kontrak - Kerja di lokasi",
      "city": "Pematangsiantar",
      "province": "Sumatera Utara",
      "coordinates": {
        "lat": -2.9760,
        "lng": 99.0743
      }
    },
    "education": {
      "level": "Diploma (D1 - D4)",
      "minGPA": 2.75
    },
    "experience": {
      "min": 1,
      "max": 3,
      "unit": "tahun"
    },
    "ageRange": {
      "min": 20,
      "max": 34
    },
    "skills": [
      "telesales",
      "Customer Engagement",
      "Customer Service",
      "Communication Skills",
      "B2C Sales",
      "Sales and Marketing",
      "Customer Relationship Management",
      "Sales Management",
      "Sales Strategy",
      "B2B Sales"
    ],
    "benefits": [
      "Health Insurance",
      "THR",
      "Work Insurance",
      "Annual Leave"
    ],
    "description": "IPK Minimal 2.75\nPendidikan minimal D3\n...",
    "descriptionBullets": [
      "IPK Minimal 2.75",
      "Pendidikan minimal D3",
      "Penempatan Pematangsiantar Megaland",
      "Memiliki kendaraan bermotor dan SIM",
      "Menawarkan produk kredit konsumtif atau produktif kepada calon nasabah sesuai target yang ditentukan",
      "Membangun dan menjaga hubungan baik dengan nasabah serta jaringan mitra di lapangan",
      "Melakukan survei kelayakan calon debitur dan mengumpulkan dokumen pendukung pengajuan kredit",
      "Melaporkan progres penjualan dan pencapaian target secara berkala kepada supervisor",
      "Memastikan kepuasan terhadap prosedur dan kebijakan bank dalam proses penjualan dan seleksi nasabah"
    ],
    "recruiter": {
      "id": "recruiter_001",
      "name": "Muhammad Faza Al Farisi",
      "avatar": "MF",
      "isPremium": true,
      "lastOnline": "2 jam yang lalu"
    },
    "metadata": {
      "postedDate": "2024-12-19",
      "updatedDate": "2024-12-19",
      "postedTime": "2 hari yang lalu",
      "updatedTime": "2 hari yang lalu",
      "views": 1250,
      "applications": 45,
      "saved": 120
    },
    "relatedJobs": [
      {
        "id": "job_001",
        "title": "Sales Assistant",
        "salary": "Rp 3 jt-5 jt",
        "contractType": "Kontrak",
        "duration": "1-3 tahun",
        "educationLevel": "Minimal SMA/SMK",
        "companyName": "PT MAP Zona Adiperkasa",
        "companyVerified": true,
        "location": "Pematangsiantar, Sumatera Utara",
        "postedTime": "2 hari yang lalu",
        "isPremium": false
      },
      {
        "id": "job_002",
        "title": "Medical Representatif",
        "salary": "Rp 2.5 jt-5 jt",
        "contractType": "Kontrak",
        "duration": "1-3 tahun",
        "educationLevel": "Minimal Diploma",
        "companyName": "PT Gaics Subroto Medika Utama",
        "companyVerified": true,
        "location": "Pematangsiantar, Sumatera Utara",
        "postedTime": "17 hari yang lalu",
        "isPremium": true
      },
      {
        "id": "job_003",
        "title": "Credit Marketing Officer",
        "salary": "Rp 3.5 jt-4 jt",
        "contractType": "Kontrak",
        "duration": "Flexible",
        "educationLevel": "Minimal SMA/SMK",
        "companyName": "Kobus Smart Service",
        "companyVerified": true,
        "location": "Pematangsiantar, Sumatera Utara",
        "postedTime": "14 hari yang lalu",
        "isPremium": false
      },
      {
        "id": "job_004",
        "title": "Team Leader",
        "salary": "Rp 3.5 jt-5 jt",
        "contractType": "Hybrid",
        "duration": "1-3 tahun, +1",
        "educationLevel": "Minimal SMA/SMK",
        "companyName": "SAIN ANUGRAH JAYA",
        "companyVerified": true,
        "location": "Pematangsiantar, Sumatera Utara",
        "postedTime": "30 hari yang lalu",
        "isPremium": false
      }
    ]
  }
}
```

---

## Component Architecture

### File Structure Rekomendasi

```
src/
├── pages/
│   └── JobDetail.jsx
├── components/
│   ├── JobDetail/
│   │   ├── Header.jsx
│   │   ├── QuickInfoStrip.jsx
│   │   ├── ActionButtons.jsx
│   │   ├── QuickSummary.jsx
│   │   ├── Skills.jsx
│   │   ├── Benefits.jsx
│   │   ├── RecruiterCard.jsx
│   │   ├── Description.jsx
│   │   ├── CompanyInfo.jsx
│   │   ├── SafetyTips.jsx
│   │   └── index.js
│   └── Sidebar/
│       ├── QRCodeBox.jsx
│       ├── RelatedJobs.jsx
│       ├── JobCard.jsx
│       └── index.js
├── styles/
│   ├── JobDetail.css
│   ├── components.css
│   └── responsive.css
├── hooks/
│   ├── useJobDetail.js
│   └── useRelatedJobs.js
├── services/
│   ├── jobApi.js
│   └── companiesApi.js
└── utils/
    ├── formatters.js
    └── helpers.js
```

---

## Key Features Summary

| Feature | Implementation |
|---------|-----------------|
| **Responsive Design** | CSS Grid, Flexbox dengan breakpoints |
| **Two Column Layout** | Grid layout dengan sidebar sticky |
| **Dynamic Data** | React State management |
| **Interactive Elements** | Buttons, links, expandable sections |
| **Styling System** | CSS Variables, modern design tokens |
| **Mobile Optimization** | Media queries & touch-friendly elements |
| **Accessibility** | Semantic HTML, ARIA labels |
| **Performance** | Lazy loading, code splitting |

---

Dokumentasi ini dapat dijadikan referensi lengkap untuk implementasi halaman detail lowongan di project kamu! 🚀

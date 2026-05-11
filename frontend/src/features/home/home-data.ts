export const valueItems = [
  {
    icon: "briefcase",
    title: "Lowongan lebih terarah",
    description: "UMKM membuat lowongan berdasarkan kebutuhan shift, kapasitas tim, dan kesiapan pendampingan harian.",
    properties: ["Shift-ready", "Target jelas", "Pendampingan awal"]
  },
  {
    icon: "radar",
    title: "Matching berbasis data perilaku",
    description: "Skor kecocokan mempertimbangkan performa kerja, konsistensi check-in, dan profil risiko individu.",
    properties: ["Skor relevansi", "Riwayat check-in", "Profil risiko"]
  },
  {
    icon: "clipboard-check",
    title: "Monitoring harian yang humanis",
    description: "Daily check memberi sinyal awal kondisi emosional agar dukungan dapat diberikan sebelum masalah membesar.",
    properties: ["Alert dini", "Follow-up cepat", "Mentoring terjadwal"]
  }
];

export const faqItems = [
  {
    question: "Apakah BinaHub hanya untuk UMKM tertentu?",
    answer:
      "Tidak. BinaHub dirancang untuk berbagai skala UMKM yang ingin membuka peluang kerja inklusif dengan proses monitoring yang lebih terstruktur."
  },
  {
    question: "Bagaimana BinaHub melakukan matching kandidat?",
    answer:
      "Sistem mencocokkan kebutuhan posisi dengan data kandidat, termasuk riwayat check-in, konsistensi kerja, dan indikator kesiapan operasional."
  },
  {
    question: "Apakah daily check wajib diisi setiap hari?",
    answer:
      "Disarankan diisi setiap hari untuk membantu deteksi dini kondisi pekerja. Data ini menjadi dasar rekomendasi tindak lanjut dan pendampingan."
  },
  {
    question: "Siapa yang bisa melihat data monitoring individu?",
    answer:
      "Akses ditentukan berdasarkan role. UMKM melihat pekerja di unitnya, sementara admin program memantau tren agregat sesuai otorisasi."
  }
];

export const flowSteps = [
  {
    title: "Registrasi dan pilih role",
    description: "Akun dibuat sesuai peran: UMKM, pekerja, atau admin program.",
    meta: "Durasi: < 5 menit"
  },
  {
    title: "Buat lowongan operasional",
    description: "Posisi, lokasi, shift, dan target performa ditentukan sejak awal.",
    meta: "Output: lowongan aktif"
  },
  {
    title: "Lihat hasil matchmaking",
    description: "Sistem menampilkan kandidat ex-napi paling relevan untuk tiap kebutuhan UMKM.",
    meta: "Output: shortlist kandidat"
  },
  {
    title: "Pantau daily check pekerja",
    description: "Dashboard individu menampilkan kondisi hari ini, riwayat check-in, dan tindak lanjut.",
    meta: "Output: rencana follow-up"
  }
];

export const roleItems = [
  {
    icon: "store",
    title: "UMKM",
    focus: "Fokus: operasional dan kestabilan tim",
    points: [
      "Kelola lowongan dan shortlist kandidat secara cepat.",
      "Pantau alert risiko serta status check-in harian.",
      "Terima rekomendasi pendampingan per individu pekerja."
    ]
  },
  {
    icon: "worker",
    title: "Pekerja Ex-Napi",
    focus: "Fokus: adaptasi kerja dan dukungan harian",
    points: [
      "Mendapat akses peluang kerja yang lebih adil.",
      "Menyampaikan kondisi harian melalui daily check terstruktur.",
      "Menerima dukungan dan mentoring sesuai kebutuhan lapangan."
    ]
  },
  {
    icon: "shield-check",
    title: "Admin Program",
    focus: "Fokus: kualitas program dan monitoring agregat",
    points: [
      "Mengawasi kualitas matching antar UMKM.",
      "Menganalisis tren risiko pada level populasi.",
      "Menjaga standar pendampingan tetap konsisten."
    ]
  }
];

export const metricItems = [
  {
    icon: "store",
    label: "UMKM Aktif",
    value: "120+",
    note: "Mitra usaha yang rutin membuka lowongan"
  },
  {
    icon: "clipboard-check",
    label: "Daily Check",
    value: "1.420",
    note: "Laporan kondisi mingguan yang terpantau"
  },
  {
    icon: "chart-up",
    label: "Match Rate",
    value: "87%",
    note: "Kandidat lanjut ke fase penempatan kerja"
  },
  {
    icon: "users",
    label: "Mentoring",
    value: "6 / minggu",
    note: "Sesi aktif untuk dukungan adaptasi pekerja"
  }
];

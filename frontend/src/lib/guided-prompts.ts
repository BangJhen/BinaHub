// Kumpulan Pertanyaan Pancingan (Guided Prompts) untuk Jurnal Pekerja
// Berguna untuk mengarahkan pekerja menulis hal-hal spesifik yang berguna bagi LLM/RAG

export type PromptCategory = "resilience" | "social_integration" | "work_environment" | "future_look";

export interface GuidedPrompt {
  id: string;
  category: PromptCategory;
  question: string;
}

export const guidedPrompts: GuidedPrompt[] = [
  // 1. Resiliensi & Coping Mechanism (Sangat penting untuk LLM)
  {
    id: "res_1",
    category: "resilience",
    question: "Godaan paling berat (terkait marah, putus asa, atau masa lalu) yang kamu alami hari ini adalah...",
  },
  {
    id: "res_2",
    category: "resilience",
    question: "Gimana cara kamu berhasil ngelewatin tantangan/kendala terbesar di kerjamu hari ini?",
  },
  
  // 2. Integrasi Sosial & Stigma
  {
    id: "soc_1",
    category: "social_integration",
    question: "Satu interaksi dengan orang lain (teman kerja/pelanggan) hari ini yang berkesan buatmu...",
  },
  {
    id: "soc_2",
    category: "social_integration",
    question: "Apakah ada momen hari ini kamu merasa di-diskriminasi atau dinilai dari masa lalumu? Ceritakan.",
  },

  // 3. Lingkungan Kerja & Beban
  {
    id: "work_1",
    category: "work_environment",
    question: "Bagian paling capek/melelahkan dari tugas kerjamu hari ini adalah...",
  },
  {
    id: "work_2",
    category: "work_environment",
    question: "Target atau tugas kecil yang berhasil kamu selesaikan dengan baik hari ini adalah...",
  },

  // 4. Harapan Masa Depan
  {
    id: "fut_1",
    category: "future_look",
    question: "Melihat kerjaan hari ini, apa satu hal yang bikin kamu semangat buat masuk kerja lagi besok?",
  },
  {
    id: "fut_2",
    category: "future_look",
    question: "Dari upah kerja hari ini, apa rencana kecil terdekat yang mau kamu lakuin buat keluarga/diri sendiri?",
  }
];

// Fungsi untuk mendapatkan 1 prompt acak (atau berdasarkan rules rotasi)
export function getRandomPrompt(): GuidedPrompt {
  const index = Math.floor(Math.random() * guidedPrompts.length);
  return guidedPrompts[index];
}
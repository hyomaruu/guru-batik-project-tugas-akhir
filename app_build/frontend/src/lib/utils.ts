// app_build/frontend/src/lib/utils.ts
export function calculateReadTime(contentHtml: string, wordsPerMinute: number = 200): number {
  // Hapus tag HTML dan hitung jumlah kata
  const textContent = contentHtml.replace(/<[^>]*>/g, '');
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  
  // Hitung waktu baca dalam menit, minimal 1 menit
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return readTime > 0 ? readTime : 1;
}
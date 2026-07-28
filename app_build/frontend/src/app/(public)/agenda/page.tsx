// src/app/(public)/agenda/page.tsx — Halaman Agenda
import type { Metadata } from "next";
import AgendaTimeline, { AgendaEvent } from "@/components/public/AgendaTimeline";
import ScrollReveal from "@/components/public/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/public/MotionWrappers";
import BatikMotif from "@/components/public/BatikMotif";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Jadwal kegiatan dan acara Guru Batik — workshop, seminar, pameran batik nusantara.",
};

export default async function AgendaPage() {
  let agendaData: AgendaEvent[] = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    const res = await fetch(baseUrl + "/agenda", { next: { revalidate: 0 } });
    const data = await res.json();
    if (data.success) {
      // Map API snake_case to camelCase
      agendaData = data.data.map((a: any) => ({
        id: a.id,
        time: a.time,
        endTime: a.end_time,
        title: a.title,
        description: a.description,
        location: a.location,
        category: a.category,
        day: a.day,
        date: a.date,
        image_url: a.image_url,
      }));
    }
  } catch (err) {
    console.error("Failed to fetch agenda", err);
  }

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pt-36 pb-20 px-6"
        style={{ backgroundColor: "#020617" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 70% 50%, rgba(59,130,246,0.15) 0%, transparent 70%)",
          }}
        />
        <BatikMotif variant="kawung" opacity={0.08} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] mb-6"
            style={{ color: "rgba(59,130,246,0.8)" }}
          >
            <span className="w-5 h-px" style={{ background: "rgba(59,130,246,0.5)" }} />
            Jadwal Kegiatan
            <span className="w-5 h-px" style={{ background: "rgba(59,130,246,0.5)" }} />
          </div>
          <h1
            className="font-bold text-white mb-4"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              letterSpacing: "-0.02em",
            }}
          >
            Agenda{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1e3a5f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Guru Batik
            </span>
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "42rem", margin: "0 auto" }}>
            Ikuti berbagai kegiatan kami — dari workshop membatik, seminar budaya, hingga pameran koleksi terbaru.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#0f172a] border-t border-white/5" id="agenda-timeline">
        <div className="max-w-5xl mx-auto px-6">
          {/* Summary cards */}
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { label: "Total Kegiatan", value: agendaData.length.toString(), icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              ) },
              { label: "Hari Acara", value: "2", icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ) },
              { label: "Workshop", value: agendaData.filter(e => e.category === "Workshop").length.toString(), icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              ) },
              { label: "Seminar", value: agendaData.filter(e => e.category === "Seminar").length.toString(), icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              ) },
            ].map((s) => (
              <StaggerItem key={s.label}>
                <div className="bg-white/5 rounded-2xl p-5 text-center border border-white/10 shadow-lg backdrop-blur-md">
                  <span className="mb-3 flex items-center justify-center text-blue-400 opacity-80">{s.icon}</span>
                  <div
                    className="text-3xl font-bold text-white mb-1"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs text-white/50 font-medium">{s.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Timeline */}
          <ScrollReveal>
            <AgendaTimeline events={agendaData} showFilter={true} />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

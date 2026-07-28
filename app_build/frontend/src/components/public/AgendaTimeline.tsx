"use client";
import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

export interface AgendaEvent {
  id: number;
  time: string;
  endTime?: string;
  title: string;
  description?: string;
  location?: string;
  category: string;
  day: string; // e.g. "Hari 1", "Hari 2"
  date: string; // e.g. "Senin, 21 Juli 2025"
  image_url?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Workshop: { bg: "rgba(30,58,95,0.1)",  text: "#1e3a5f", border: "rgba(30,58,95,0.25)" },
  Seminar:  { bg: "rgba(59,130,246,0.12)", text: "#1e40af", border: "rgba(59,130,246,0.3)" },
  Pameran:  { bg: "rgba(96,165,250,0.12)", text: "#1d4ed8", border: "rgba(96,165,250,0.3)" },
  Demo:     { bg: "rgba(30,64,175,0.1)",  text: "#1e40af", border: "rgba(30,64,175,0.25)" },
  Lainnya:  { bg: "rgba(71,85,105,0.1)",  text: "#475569", border: "rgba(71,85,105,0.2)" },
};

function CategoryPill({ category }: { category: string }) {
  const c = CATEGORY_COLORS[category] || CATEGORY_COLORS.Lainnya;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {category}
    </span>
  );
}

function TimelineItem({ event, isRight, delay = 0 }: { event: AgendaEvent; isRight: boolean; delay?: number }) {
  return (
    <ScrollReveal delay={delay}>
      <div className={`pub-timeline-item mb-8 md:mb-12 ${isRight ? "md:flex-row-reverse" : ""}`}>
        {/* Mobile left column / Desktop spacer */}
      <div className="relative flex-shrink-0 flex flex-col items-center md:w-1/2">
        {/* Dot — mobile: shows on left; desktop: centered */}
        <div className="pub-timeline-dot md:mx-auto">
          <svg className="w-5 h-5 text-batik-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Card side — alternates on desktop */}
      <div className={`flex-1 md:w-1/2 ${isRight ? "md:pr-12" : "md:pl-12"}`}>
        <div className="pub-timeline-card">
          {/* Time badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="pub-timeline-time">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {event.time}{event.endTime ? ` — ${event.endTime}` : ""}
            </span>
            <CategoryPill category={event.category} />
          </div>

          {/* Image */}
          {event.image_url && (
            <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-slate-100">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Title */}
          <h3
            className="font-bold text-batik-text text-base md:text-lg mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-batik-muted leading-relaxed mb-3">{event.description}</p>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-1.5 text-xs text-batik-muted/70">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </div>
          )}
        </div>
      </div>
      </div>
    </ScrollReveal>
  );
}

function DayHeader({ day, date }: { day: string; date: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div
        className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-white flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)",
          boxShadow: "0 4px 16px rgba(30,58,95,0.3)",
        }}
      >
        <span className="text-xs font-bold uppercase tracking-wider opacity-80">{day.split(" ")[0]}</span>
        <span className="text-lg font-bold leading-none">{day.split(" ")[1] || ""}</span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-batik-primary/70 mb-0.5">
          {day}
        </p>
        <p className="text-sm font-semibold text-batik-text">{date}</p>
      </div>
      <div
        className="flex-1 h-px"
        style={{
          background: "linear-gradient(90deg, rgba(30,58,95,0.3), transparent)",
        }}
      />
    </div>
  );
}

interface AgendaTimelineProps {
  events: AgendaEvent[];
  showFilter?: boolean;
}

export default function AgendaTimeline({ events, showFilter = true }: AgendaTimelineProps) {
  const days = Array.from(new Set(events.map((e) => e.day)));
  const [activeDay, setActiveDay] = useState("Semua");

  const filtered =
    activeDay === "Semua" ? events : events.filter((e) => e.day === activeDay);

  // Group by day
  const grouped = days.reduce<Record<string, AgendaEvent[]>>((acc, day) => {
    const dayEvents = filtered.filter((e) => e.day === day);
    if (dayEvents.length) acc[day] = dayEvents;
    return acc;
  }, {});

  return (
    <div>
      {/* Filter tabs */}
      {showFilter && days.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-10 md:mb-14">
          {["Semua", ...days].map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeDay === day
                  ? "bg-batik-primary text-white shadow-warm-sm"
                  : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      {Object.entries(grouped).map(([day, dayEvents]) => {
        const dateStr = dayEvents[0]?.date || "";
        return (
          <div key={day} className="mb-12 md:mb-16">
            <DayHeader day={day} date={dateStr} />
            <div className="pub-timeline-container pl-8 md:pl-0">
              {dayEvents.map((event, i) => (
                <TimelineItem key={event.id} event={event} isRight={i % 2 !== 0} delay={i * 100} />
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-batik-muted">Tidak ada agenda untuk hari ini.</p>
        </div>
      )}
    </div>
  );
}

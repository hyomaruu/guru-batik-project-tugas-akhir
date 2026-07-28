import React from 'react';

/** Batik motif: concentric circles with dot connectors */
function BatikCircleMotif({ x, y, r, opacity = 0.18, animate = false }: { x: number; y: number; r: number; opacity?: number; animate?: boolean }) {
  const r2 = r * 0.6;
  const r3 = r * 0.25;
  const dots = 8;
  return (
    <g opacity={opacity} style={animate ? { animation: "batikFloat 6s ease-in-out infinite" } : {}}>
      <circle cx={x} cy={y} r={r} stroke="currentColor" strokeWidth="1.5" fill="none" />
      {Array.from({ length: dots }).map((_, i) => {
        const angle = (i * Math.PI * 2) / dots - Math.PI / 2;
        const dx = x + r * Math.cos(angle);
        const dy = y + r * Math.sin(angle);
        return <circle key={i} cx={dx} cy={dy} r={r * 0.06} fill="currentColor" />;
      })}
      <circle cx={x} cy={y} r={r2} stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx={x} cy={y} r={r3} stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx={x} cy={y} r={r3 * 0.4} fill="currentColor" />
      <line x1={x} y1={y - r} x2={x} y2={y - r2} stroke="currentColor" strokeWidth="1" />
    </g>
  );
}

/** Batik motif: cross/snowflake pixel star */
function BatikStarMotif({ x, y, size = 16, opacity = 0.15 }: { x: number; y: number; size?: number; opacity?: number }) {
  const s = size;
  return (
    <g opacity={opacity}>
      <rect x={x - s * 0.1} y={y - s / 2} width={s * 0.2} height={s} fill="currentColor" />
      <rect x={x - s / 2} y={y - s * 0.1} width={s} height={s * 0.2} fill="currentColor" />
      <rect x={x + s * 0.25} y={y - s * 0.25 - s * 0.1} width={s * 0.2} height={s * 0.2} fill="currentColor" />
      <rect x={x - s * 0.45} y={y - s * 0.25 - s * 0.1} width={s * 0.2} height={s * 0.2} fill="currentColor" />
      <rect x={x + s * 0.25} y={y + s * 0.05} width={s * 0.2} height={s * 0.2} fill="currentColor" />
      <rect x={x - s * 0.45} y={y + s * 0.05} width={s * 0.2} height={s * 0.2} fill="currentColor" />
      <rect x={x - s * 0.08} y={y - s * 0.5 - s * 0.15} width={s * 0.16} height={s * 0.16} fill="currentColor" transform={`rotate(45,${x},${y - s * 0.5 - s * 0.07})`} />
      <rect x={x - s * 0.08} y={y + s * 0.35} width={s * 0.16} height={s * 0.16} fill="currentColor" transform={`rotate(45,${x},${y + s * 0.42})`} />
    </g>
  );
}

/** Batik diamond dot */
function BatikDiamond({ x, y, size = 8, opacity = 0.15 }: { x: number; y: number; size?: number; opacity?: number }) {
  return (
    <rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      opacity={opacity}
      transform={`rotate(45,${x},${y})`}
    />
  );
}

/** Dotted curved connecting line */
function BatikDottedLine({ x1, y1, x2, y2, opacity = 0.12 }: { x1: number; y1: number; x2: number; y2: number; opacity?: number }) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="currentColor"
      strokeWidth="1"
      strokeDasharray="3 8"
      opacity={opacity}
    />
  );
}

export default function HeroBatikPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <BatikDottedLine x1={100} y1={80} x2={320} y2={120} />
      <BatikDottedLine x1={320} y1={120} x2={560} y2={80} />
      <BatikDottedLine x1={560} y1={80} x2={820} y2={130} />
      <BatikDottedLine x1={820} y1={130} x2={1100} y2={70} />
      <BatikDottedLine x1={1100} y1={70} x2={1380} y2={110} />
      <BatikDottedLine x1={150} y1={280} x2={430} y2={320} />
      <BatikDottedLine x1={650} y1={260} x2={900} y2={310} />
      <BatikDottedLine x1={980} y1={280} x2={1250} y2={250} />
      <BatikDottedLine x1={80} y1={500} x2={360} y2={540} />
      <BatikDottedLine x1={500} y1={480} x2={750} y2={520} />
      <BatikDottedLine x1={900} y1={460} x2={1150} y2={510} />
      <BatikDottedLine x1={1200} y1={480} x2={1420} y2={500} />
      <BatikDottedLine x1={200} y1={720} x2={500} y2={760} />
      <BatikDottedLine x1={700} y1={700} x2={1000} y2={750} />
      <BatikDottedLine x1={1100} y1={720} x2={1380} y2={740} />

      <BatikCircleMotif x={200} y={120} r={70} opacity={0.22} />
      <BatikCircleMotif x={680} y={90} r={55} opacity={0.16} />
      <BatikCircleMotif x={1180} y={110} r={65} opacity={0.20} />
      <BatikCircleMotif x={90} y={320} r={50} opacity={0.14} />
      <BatikCircleMotif x={430} y={300} r={80} opacity={0.18} animate />
      <BatikCircleMotif x={820} y={280} r={55} opacity={0.15} />
      <BatikCircleMotif x={1280} y={290} r={48} opacity={0.13} />
      <BatikCircleMotif x={220} y={520} r={45} opacity={0.12} />
      <BatikCircleMotif x={620} y={500} r={62} opacity={0.16} animate />
      <BatikCircleMotif x={1050} y={490} r={50} opacity={0.14} />
      <BatikCircleMotif x={1380} y={510} r={40} opacity={0.11} />
      <BatikCircleMotif x={350} y={720} r={38} opacity={0.10} />
      <BatikCircleMotif x={900} y={740} r={44} opacity={0.12} />
      <BatikCircleMotif x={1300} y={700} r={36} opacity={0.09} />

      <BatikStarMotif x={350} y={100} size={22} opacity={0.20} />
      <BatikStarMotif x={850} y={75} size={18} opacity={0.16} />
      <BatikStarMotif x={1050} y={140} size={20} opacity={0.18} />
      <BatikStarMotif x={140} y={220} size={16} opacity={0.15} />
      <BatikStarMotif x={600} y={210} size={22} opacity={0.20} />
      <BatikStarMotif x={1000} y={200} size={18} opacity={0.16} />
      <BatikStarMotif x={1350} y={195} size={20} opacity={0.17} />
      <BatikStarMotif x={310} y={430} size={16} opacity={0.14} />
      <BatikStarMotif x={750} y={400} size={20} opacity={0.18} />
      <BatikStarMotif x={1170} y={420} size={18} opacity={0.15} />
      <BatikStarMotif x={100} y={650} size={16} opacity={0.12} />
      <BatikStarMotif x={530} y={650} size={20} opacity={0.15} />
      <BatikStarMotif x={1100} y={640} size={18} opacity={0.13} />

      <BatikDiamond x={450} y={75} size={10} opacity={0.18} />
      <BatikDiamond x={760} y={160} size={8} opacity={0.14} />
      <BatikDiamond x={980} y={85} size={10} opacity={0.16} />
      <BatikDiamond x={1250} y={170} size={8} opacity={0.13} />
      <BatikDiamond x={55} y={420} size={10} opacity={0.14} />
      <BatikDiamond x={720} y={340} size={8} opacity={0.12} />
      <BatikDiamond x={1130} y={360} size={10} opacity={0.14} />
      <BatikDiamond x={480} y={580} size={8} opacity={0.12} />
      <BatikDiamond x={1010} y={600} size={10} opacity={0.13} />
      <BatikDiamond x={1420} y={400} size={8} opacity={0.11} />

      <circle cx="720" cy="450" r="380" stroke="rgba(59,130,246,0.04)" strokeWidth="80" fill="none" />
      <circle cx="720" cy="450" r="250" stroke="rgba(30,58,95,0.06)" strokeWidth="2" strokeDasharray="4 12" fill="none" />
    </svg>
  );
}

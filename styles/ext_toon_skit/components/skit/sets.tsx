// The Toon Skit's sets: flat, muted, outlined rooms drawn on a 1080x1920 page.
// Muted on purpose, so the characters' costume colours pop. Nothing here moves:
// a set is painted once per shot. Seats are drawn under sitting characters by
// character.tsx (seatFor), so every set can seat anyone anywhere.
import React from "react";
import type { SetName } from "./contract";
import { INK, shade } from "./ink";

const LW = 6;
const line = { stroke: INK, strokeWidth: LW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** The y of the floor line in a wide shot, where feet stand. */
export const FLOOR_Y = 1470;

// ── the cell: cinder-block walls, bars, a high barred window, a steel sink ───
const Cell: React.FC = () => {
  const wall = "#6b6f65", mortar = "#5a5d55", floor = "#4c4f48";
  const rows: React.ReactNode[] = [];
  for (let r = 0; r < 21; r++) {
    const y = r * 70;
    rows.push(<line key={`h${r}`} x1={0} x2={1080} y1={y} y2={y} stroke={mortar} strokeWidth={4} />);
    const off = r % 2 ? 80 : 0;
    for (let x = off; x < 1080; x += 160) rows.push(<line key={`v${r}-${x}`} x1={x} x2={x} y1={y} y2={y + 70} stroke={mortar} strokeWidth={4} />);
  }
  const bars: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const x = 30 + i * 46;
    bars.push(<rect key={i} x={x} y={120} width={18} height={FLOOR_Y + 20 - 120} fill="#3c3e3a" {...line} strokeWidth={4} />);
  }
  return (
    <g>
      <rect x={0} y={0} width={1080} height={FLOOR_Y} fill={wall} />
      {rows}
      {/* light from the window, a flat wash */}
      <path d={`M 600 380 L 880 380 L 1080 1150 L 420 1150 Z`} fill="#ffffff" opacity={0.06} />
      <rect x={600} y={190} width={280} height={190} fill="#b7d0d3" {...line} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={620 + i * 56} y={190} width={12} height={190} fill="#3c3e3a" />)}
      <rect x={0} y={FLOOR_Y} width={1080} height={1920 - FLOOR_Y} fill={floor} />
      <line x1={0} x2={1080} y1={FLOOR_Y} y2={FLOOR_Y} {...line} />
      {/* the barred wall on the left */}
      <rect x={10} y={100} width={350} height={34} fill="#3c3e3a" {...line} strokeWidth={4} />
      {bars}
      <rect x={10} y={800} width={350} height={26} fill="#3c3e3a" {...line} strokeWidth={4} />
      {/* steel sink on the back wall */}
      <rect x={880} y={1060} width={150} height={70} rx={10} fill="#a5aaa8" {...line} />
      <rect x={940} y={1130} width={30} height={160} fill="#8d9290" {...line} strokeWidth={4} />
      <path d="M 930 1060 L 930 1030 L 975 1030" fill="none" {...line} strokeWidth={5} />
    </g>
  );
};

// ── the office: blue-grey wall, blinds, a wall clock, a desk with a monitor ──
const Office: React.FC = () => {
  const wall = "#9ba5a4", floor = "#5d6561";
  const slats = Array.from({ length: 11 }, (_, i) => (
    <line key={i} x1={560} x2={980} y1={300 + i * 38} y2={300 + i * 38} stroke="#7d8a8c" strokeWidth={5} />
  ));
  return (
    <g>
      <rect x={0} y={0} width={1080} height={FLOOR_Y} fill={wall} />
      <rect x={0} y={FLOOR_Y - 40} width={1080} height={40} fill={shade(wall, 0.8)} />
      <rect x={560} y={280} width={420} height={440} fill="#d6e3e3" {...line} />
      {slats}
      {/* high enough that a close-up (y*1.9 - 900) and a two-shot (y*1.35 - 560) crop it out whole */}
      <circle cx={220} cy={310} r={80} fill="#ecebe5" {...line} />
      <line x1={220} y1={310} x2={220} y2={255} {...line} />
      <line x1={220} y1={310} x2={258} y2={330} {...line} />
      {/* door */}
      <rect x={70} y={760} width={230} height={FLOOR_Y - 760} fill="#8a7a66" {...line} />
      <circle cx={270} cy={1140} r={12} fill="#c9b27a" {...line} strokeWidth={4} />
      <rect x={0} y={FLOOR_Y} width={1080} height={1920 - FLOOR_Y} fill={floor} />
      <line x1={0} x2={1080} y1={FLOOR_Y} y2={FLOOR_Y} {...line} />
      {/* desk and monitor, back right */}
      <rect x={640} y={1180} width={420} height={36} fill="#8a6f52" {...line} />
      <rect x={660} y={1216} width={26} height={250} fill="#6e5841" {...line} strokeWidth={4} />
      <rect x={1010} y={1216} width={26} height={250} fill="#6e5841" {...line} strokeWidth={4} />
      <rect x={760} y={1010} width={220} height={140} rx={8} fill="#33383d" {...line} />
      <rect x={778} y={1026} width={184} height={108} fill="#6f8f9c" />
      <rect x={855} y={1150} width={30} height={30} fill="#33383d" {...line} strokeWidth={4} />
      {/* plant */}
      <path d="M 990 1090 Q 950 1020 980 980 M 990 1090 Q 1030 1010 1050 1000 M 990 1090 Q 990 1010 1000 960" fill="none" stroke="#4e7a48" strokeWidth={16} strokeLinecap="round" />
      <rect x={960} y={1090} width={64} height={90} fill="#b4673f" {...line} />
    </g>
  );
};

// ── the living room: striped wallpaper, a picture, a lamp, floorboards, a rug ─
const LivingRoom: React.FC = () => {
  const wall = "#b3a58b", floor = "#6e5a46";
  const stripes = Array.from({ length: 9 }, (_, i) => (
    <rect key={i} x={i * 120 + 30} y={0} width={44} height={FLOOR_Y} fill={shade(wall, 0.93)} />
  ));
  const planks = Array.from({ length: 6 }, (_, i) => (
    <line key={i} x1={0} x2={1080} y1={FLOOR_Y + 70 * (i + 1)} y2={FLOOR_Y + 70 * (i + 1)} stroke={shade(floor, 0.82)} strokeWidth={4} />
  ));
  return (
    <g>
      <rect x={0} y={0} width={1080} height={FLOOR_Y} fill={wall} />
      {stripes}
      <rect x={0} y={FLOOR_Y - 34} width={1080} height={34} fill="#e2d8c2" {...line} strokeWidth={4} />
      {/* a framed landscape: two hills and a sun, nothing anyone owns */}
      <rect x={200} y={360} width={320} height={240} fill="#c3d6d6" {...line} />
      <path d="M 200 600 L 300 470 L 380 560 L 440 500 L 520 600 Z" fill="#7e9a6c" />
      <circle cx={455} cy={420} r={28} fill="#e9c46a" />
      <rect x={200} y={360} width={320} height={240} fill="none" stroke="#6e4e33" strokeWidth={16} />
      {/* window with curtains */}
      <rect x={640} y={300} width={300} height={420} fill="#c9dde0" {...line} />
      <line x1={790} x2={790} y1={300} y2={720} {...line} strokeWidth={5} />
      <path d="M 610 280 L 700 280 Q 680 520 720 760 L 610 760 Z" fill="#8c5a5a" {...line} />
      <path d="M 970 280 L 880 280 Q 900 520 860 760 L 970 760 Z" fill="#8c5a5a" {...line} />
      {/* floor lamp */}
      <line x1={110} x2={110} y1={900} y2={FLOOR_Y} {...line} strokeWidth={10} />
      <path d="M 40 900 L 180 900 L 150 780 L 70 780 Z" fill="#e6d29a" {...line} />
      <ellipse cx={110} cy={FLOOR_Y} rx={60} ry={14} fill="#3a3530" />
      <rect x={0} y={FLOOR_Y} width={1080} height={1920 - FLOOR_Y} fill={floor} />
      {planks}
      <line x1={0} x2={1080} y1={FLOOR_Y} y2={FLOOR_Y} {...line} />
      <ellipse cx={560} cy={FLOOR_Y + 130} rx={430} ry={90} fill="#7d4f45" {...line} />
      <ellipse cx={560} cy={FLOOR_Y + 130} rx={340} ry={62} fill="none" stroke="#a9765f" strokeWidth={10} />
    </g>
  );
};

// ── the street: a pale sky, three shop fronts, a pavement, a lamp post, a road ─
const Street: React.FC = () => {
  const fronts = [
    { x: -20, w: 380, top: 260, c: "#9a7b6a" },
    { x: 360, w: 360, top: 160, c: "#8b9488" },
    { x: 720, w: 380, top: 320, c: "#a3957b" },
  ];
  const windows: React.ReactNode[] = [];
  fronts.forEach((f, i) => {
    for (let y = f.top + 70; y < 900; y += 170)
      for (let k = 0; k < 3; k++)
        windows.push(<rect key={`${i}-${y}-${k}`} x={f.x + 50 + k * 105} y={y} width={70} height={100} fill="#c5d7da" {...line} strokeWidth={4} />);
  });
  const awning = Array.from({ length: 7 }, (_, i) => (
    <path key={i} d={`M ${380 + i * 46} 980 L ${426 + i * 46} 980 L ${426 + i * 46} 1060 L ${380 + i * 46} 1060 Z`} fill={i % 2 ? "#e8e2d2" : "#8f5d55"} />
  ));
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1200} fill="#aac1c6" />
      {fronts.map((f, i) => <rect key={i} x={f.x} y={f.top} width={f.w} height={FLOOR_Y - f.top} fill={f.c} {...line} />)}
      {windows}
      {/* ground floor shop */}
      <rect x={390} y={1060} width={300} height={FLOOR_Y - 1060} fill="#5e6a6c" {...line} />
      <rect x={410} y={1080} width={260} height={260} fill="#9fb6ba" {...line} strokeWidth={4} />
      {awning}
      <path d="M 380 980 L 702 980 L 702 1060 L 380 1060 Z" fill="none" {...line} />
      <rect x={0} y={FLOOR_Y} width={1080} height={150} fill="#8c8b85" />
      <line x1={0} x2={1080} y1={FLOOR_Y} y2={FLOOR_Y} {...line} />
      {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={i * 200 + 60} x2={i * 200 + 20} y1={FLOOR_Y} y2={FLOOR_Y + 150} stroke="#76756f" strokeWidth={4} />)}
      <rect x={0} y={FLOOR_Y + 150} width={1080} height={22} fill="#b1afa8" {...line} strokeWidth={4} />
      <rect x={0} y={FLOOR_Y + 172} width={1080} height={1920 - FLOOR_Y - 172} fill="#4a4c4e" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 300 + 60} y={1800} width={160} height={16} fill="#d8d3b8" />)}
      {/* lamp post */}
      <rect x={950} y={700} width={22} height={FLOOR_Y + 60 - 700} fill="#353a3d" {...line} strokeWidth={4} />
      <path d="M 961 700 Q 961 640 900 640 L 880 640" fill="none" stroke="#353a3d" strokeWidth={14} />
      <path d="M 850 640 L 910 640 L 895 680 L 865 680 Z" fill="#e7d79a" {...line} strokeWidth={4} />
    </g>
  );
};

export const SET_DRAWINGS: Record<SetName, React.FC> = {
  cell: Cell,
  office: Office,
  living_room: LivingRoom,
  street: Street,
};

/** The kind of seat a sitting character gets in each set. */
export const SEAT_KIND: Record<SetName, "cot" | "chair" | "sofa" | "bench"> = {
  cell: "cot",
  office: "chair",
  living_room: "sofa",
  street: "bench",
};

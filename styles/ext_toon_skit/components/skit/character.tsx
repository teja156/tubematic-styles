// A Toon Skit character: a big round head with a thick outline, a costume
// block for the torso, black stick arms with mitten hands, trouser legs (or
// stick legs under a dress) and round black shoes. Drawn facing right in local
// units with the feet at y = 0 and the full height about 600; the caller
// mirrors it for "left" and scales it per framing.
//
// Limited animation, like a TV cartoon: poses and faces switch on their frames
// (no tween), the speaker's mouth changes shape every few frames while a word
// is being spoken, and everyone blinks now and then.
import React from "react";
import type { Face, Look, Pose } from "./contract";
import { COLOR, HAIR, INK, SKIN, TROUSERS, rand, shade } from "./ink";

export const HEAD_Y = -470;
export const HEAD_R = 110;
const SH_Y = -350; // shoulders
const HIP_Y = -175;
export const SIT_DROP = 60; // how far the upper body drops when seated

export type Mouth = "rest" | "open" | "o" | "wide";
export type SeatKind = "cot" | "chair" | "sofa" | "bench";

type P = [number, number];
type ArmPose = { elbow: P; hand: P; finger?: P };

// arm points for a character facing right: "lead" is the arm on the facing side
const STAND_LEAD: ArmPose = { elbow: [96, -262], hand: [104, -172] };
const STAND_FAR: ArmPose = { elbow: [-96, -262], hand: [-104, -172] };

function arms(pose: Pose, frame: number, talking: boolean): { lead: ArmPose; far: ArmPose; farBehindHead?: boolean } {
  const bob = talking ? Math.round(Math.sin(frame / 3) * 8) : 0;
  switch (pose) {
    case "point":
      return { lead: { elbow: [150, -342], hand: [232, -352], finger: [36, -2] }, far: STAND_FAR };
    case "shrug":
      return { lead: { elbow: [128, -282], hand: [198, -338] }, far: { elbow: [-128, -282], hand: [-198, -338] } };
    case "arms_crossed":
      return { lead: { elbow: [84, -252], hand: [-46, -284] }, far: { elbow: [-84, -250], hand: [52, -272] } };
    case "hand_head":
      return { lead: STAND_LEAD, far: { elbow: [-150, -470], hand: [-92, -528] }, farBehindHead: true };
    case "finger_up":
      return { lead: { elbow: [140, -290], hand: [150, -398], finger: [0, -36] }, far: STAND_FAR };
    case "hands_hips":
      return { lead: { elbow: [142, -268], hand: [74, -196] }, far: { elbow: [-142, -268], hand: [-74, -196] } };
    case "wave": {
      const s = Math.round(Math.sin(frame / 2.5) * 26);
      return { lead: { elbow: [142, -402], hand: [168 + s, -502] }, far: STAND_FAR };
    }
    case "gesture":
      return { lead: { elbow: [122, -272], hand: [196, -300 + bob] }, far: STAND_FAR };
    case "sit_relaxed":
      return { lead: STAND_LEAD, far: { elbow: [-150, -470], hand: [-92, -528] }, farBehindHead: true };
    default:
      return { lead: STAND_LEAD, far: STAND_FAR };
  }
}

// ── face parts (head-centre coordinates) ──────────────────────────────────────
type EyeKind = "dot" | "big" | "happy" | "lid" | "shut";
type BrowKind = "flat" | "raised" | "high" | "angry" | "sad" | "smug" | "sceptical";
type MouthShape = "line" | "smile" | "frown" | "smirk" | "laugh" | "o" | "open" | "wide" | "wavy";

const FACE_PARTS: Record<Face, { eyes: EyeKind; brows: BrowKind; mouth: MouthShape; talk: MouthShape[] }> = {
  neutral: { eyes: "dot", brows: "flat", mouth: "line", talk: ["open", "o", "line", "wide"] },
  happy: { eyes: "happy", brows: "raised", mouth: "smile", talk: ["laugh", "open", "smile", "wide"] },
  laugh: { eyes: "happy", brows: "raised", mouth: "laugh", talk: ["laugh", "wide", "laugh", "open"] },
  smug: { eyes: "lid", brows: "smug", mouth: "smirk", talk: ["open", "smirk", "wide", "o"] },
  surprised: { eyes: "big", brows: "high", mouth: "o", talk: ["o", "wide", "open", "o"] },
  angry: { eyes: "dot", brows: "angry", mouth: "frown", talk: ["wide", "open", "frown", "wide"] },
  sceptical: { eyes: "lid", brows: "sceptical", mouth: "line", talk: ["open", "line", "o", "open"] },
  sad: { eyes: "dot", brows: "sad", mouth: "frown", talk: ["open", "o", "frown", "open"] },
  worried: { eyes: "big", brows: "sad", mouth: "wavy", talk: ["open", "o", "wavy", "open"] },
  sleepy: { eyes: "shut", brows: "flat", mouth: "smile", talk: ["open", "smile", "o", "open"] },
};

const EYE_X = 38, EYE_Y = -14;

const Eye: React.FC<{ kind: EyeKind; x: number; look: number; skin: string; lw: number }> = ({ kind, x, look, skin, lw }) => {
  const y = EYE_Y;
  if (kind === "dot") return <ellipse cx={x + look * 0.5} cy={y} rx={9} ry={13} fill={INK} />;
  if (kind === "happy") return <path d={`M ${x - 18} ${y + 6} Q ${x} ${y - 16} ${x + 18} ${y + 6}`} fill="none" stroke={INK} strokeWidth={lw} strokeLinecap="round" />;
  if (kind === "shut") return <path d={`M ${x - 18} ${y} Q ${x} ${y + 9} ${x + 18} ${y}`} fill="none" stroke={INK} strokeWidth={lw} strokeLinecap="round" />;
  const r = kind === "big" ? 31 : 27;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#ffffff" stroke={INK} strokeWidth={lw * 0.8} />
      <circle cx={x + look} cy={y + (kind === "lid" ? 6 : 2)} r={kind === "big" ? 9 : 11} fill={INK} />
      {kind === "lid" ? <path d={`M ${x - r} ${y + 2} A ${r} ${r} 0 0 1 ${x + r} ${y + 2} Z`} fill={skin} stroke={INK} strokeWidth={lw * 0.8} /> : null}
    </g>
  );
};

function browLine(kind: BrowKind, side: 1 | -1): [number, number] {
  // [outer y, inner y] for the brow on this side (1 = facing side)
  switch (kind) {
    case "raised": return [-62, -64];
    case "high": return [-76, -80];
    case "angry": return [-64, -40];
    case "sad": return [-48, -66];
    case "smug": return side === 1 ? [-70, -62] : [-50, -50];
    case "sceptical": return side === 1 ? [-46, -46] : [-72, -66];
    default: return [-52, -52];
  }
}

const MouthPath: React.FC<{ shape: MouthShape; dx: number; lw: number }> = ({ shape, dx, lw }) => {
  const s = { fill: "none", stroke: INK, strokeWidth: lw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const dark = "#4a1717";
  const y = 50;
  const x = dx;
  switch (shape) {
    case "smile": return <path d={`M ${x - 32} ${y - 6} Q ${x} ${y + 22} ${x + 32} ${y - 6}`} {...s} />;
    case "frown": return <path d={`M ${x - 28} ${y + 12} Q ${x} ${y - 8} ${x + 28} ${y + 12}`} {...s} />;
    case "smirk": return <path d={`M ${x - 14} ${y + 4} Q ${x + 12} ${y + 12} ${x + 34} ${y - 10}`} {...s} />;
    case "wavy": return <path d={`M ${x - 30} ${y + 4} q 10 -10 20 0 q 10 10 20 0 q 10 -10 20 0`} {...s} />;
    case "o": return <ellipse cx={x} cy={y + 6} rx={13} ry={17} fill={dark} stroke={INK} strokeWidth={lw * 0.8} />;
    case "open":
      return (
        <g>
          <ellipse cx={x} cy={y + 6} rx={24} ry={16} fill={dark} stroke={INK} strokeWidth={lw * 0.8} />
          <path d={`M ${x - 16} ${y - 4} L ${x + 16} ${y - 4} L ${x + 14} ${y + 2} L ${x - 14} ${y + 2} Z`} fill="#ffffff" />
        </g>
      );
    case "wide":
    case "laugh":
      return (
        <g>
          <path d={`M ${x - 40} ${y - 8} Q ${x} ${y - 4} ${x + 40} ${y - 8} Q ${x + 32} ${y + 44} ${x} ${y + 44} Q ${x - 32} ${y + 44} ${x - 40} ${y - 8} Z`} fill={dark} stroke={INK} strokeWidth={lw * 0.8} strokeLinejoin="round" />
          <path d={`M ${x - 34} ${y - 6} Q ${x} ${y - 2} ${x + 34} ${y - 6} L ${x + 31} ${y + 6} Q ${x} ${y + 9} ${x - 31} ${y + 6} Z`} fill="#ffffff" />
          <ellipse cx={x + 6} cy={y + 32} rx={16} ry={8} fill="#c7575a" />
        </g>
      );
    default: return <path d={`M ${x - 22} ${y + 2} L ${x + 22} ${y + 2}`} {...s} />;
  }
};

// ── hair, hats, facial hair (head-centre coordinates, r = 110) ────────────────
const HairBack: React.FC<{ look: Look; lw: number }> = ({ look, lw }) => {
  if (look.hair !== "long") return null;
  return <path d="M -128 -20 Q -140 150 -100 170 L 100 170 Q 140 150 128 -20 Z" fill={HAIR[look.hairColor]} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />;
};

const HairFront: React.FC<{ look: Look; lw: number; back?: boolean }> = ({ look, lw, back }) => {
  const c = HAIR[look.hairColor];
  const st = { fill: c, stroke: INK, strokeWidth: lw, strokeLinejoin: "round" as const };
  if (back && look.hair !== "none" && look.hair !== "balding") {
    // from behind, the hair covers most of the head
    return <path d="M -112 -10 C -118 -128 118 -128 112 -10 C 110 40 90 80 60 92 L -60 92 C -90 80 -110 40 -112 -10 Z" {...st} />;
  }
  switch (look.hair) {
    case "short": return <path d="M -112 -14 C -118 -124 118 -124 112 -14 C 96 -58 40 -74 -10 -70 C -60 -66 -96 -50 -112 -14 Z" {...st} />;
    case "side_part": return <path d="M -112 -10 C -120 -128 116 -126 112 -20 C 104 -62 60 -82 10 -84 C 30 -60 -40 -48 -112 -10 Z" {...st} />;
    case "spiky": return <path d="M -110 -20 L -120 -70 L -84 -82 L -86 -122 L -44 -110 L -30 -150 L 4 -118 L 34 -150 L 50 -110 L 92 -124 L 88 -80 L 122 -68 L 110 -20 C 80 -64 -80 -64 -110 -20 Z" {...st} />;
    case "curly":
      return <g>{[-100, -70, -34, 4, 42, 78, 104].map((x, i) => <circle key={i} cx={x} cy={-60 - Math.round(Math.cos((x / 110) * 1.4) * 52)} r={34} {...st} />)}</g>;
    case "long": return <path d="M -114 -4 C -122 -128 122 -128 114 -4 C 90 -70 30 -84 0 -64 C -30 -84 -90 -70 -114 -4 Z" {...st} />;
    case "bun":
      return (
        <g>
          <circle cx={0} cy={-120} r={40} {...st} />
          <path d="M -112 -14 C -118 -124 118 -124 112 -14 C 96 -58 40 -70 0 -70 C -40 -70 -96 -58 -112 -14 Z" {...st} />
        </g>
      );
    case "balding":
      return (
        <g>
          <path d="M -108 -40 Q -136 -20 -118 20 Q -104 34 -100 6 Q -96 -20 -108 -40 Z" {...st} />
          <path d="M 108 -40 Q 136 -20 118 20 Q 104 34 100 6 Q 96 -20 108 -40 Z" {...st} />
        </g>
      );
    default: return null;
  }
};

const HatDraw: React.FC<{ look: Look; lw: number; back?: boolean }> = ({ look, lw, back }) => {
  if (look.hat === "none") return null;
  const c = look.hat === "hard_hat" ? "#e6b422" : COLOR[look.hatColor ?? look.outfitColor];
  const st = { fill: c, stroke: INK, strokeWidth: lw, strokeLinejoin: "round" as const };
  switch (look.hat) {
    case "peaked_cap":
      return (
        <g>
          <path d="M -118 -58 C -150 -150 -40 -190 60 -168 C 150 -150 150 -90 122 -58 Z" {...st} />
          <rect x={-120} y={-72} width={244} height={26} fill={shade(c, 0.6)} stroke={INK} strokeWidth={lw} />
          {back ? null : <path d="M -60 -48 Q 50 -30 150 -56 L 150 -40 Q 50 -10 -60 -36 Z" fill={INK} />}
          {back ? null : <circle cx={14} cy={-118} r={18} fill="#d8b04a" stroke={INK} strokeWidth={lw * 0.7} />}
        </g>
      );
    case "cap":
      return (
        <g>
          <path d="M -114 -40 C -124 -150 124 -150 114 -40 Z" {...st} />
          {back ? null : <path d="M 40 -44 Q 140 -60 178 -34 Q 120 -24 40 -30 Z" {...st} />}
        </g>
      );
    case "beanie":
      return (
        <g>
          <path d="M -112 -46 C -120 -168 120 -168 112 -46 Z" {...st} />
          <rect x={-118} y={-66} width={236} height={34} rx={10} fill={shade(c, 0.8)} stroke={INK} strokeWidth={lw} />
        </g>
      );
    case "hard_hat":
      return (
        <g>
          <path d="M -104 -54 C -110 -160 110 -160 104 -54 Z" {...st} />
          <path d="M -140 -54 L 140 -54 L 134 -36 L -134 -36 Z" {...st} />
        </g>
      );
    default: return null;
  }
};

const FacialHair: React.FC<{ look: Look; dx: number; lw: number; seed: string }> = ({ look, dx, lw, seed }) => {
  const c = look.hairColor === "white" || look.hairColor === "grey" ? HAIR[look.hairColor] : shade(HAIR[look.hairColor], 0.9);
  if (look.facial === "stubble") {
    const dots: React.ReactNode[] = [];
    for (let i = 0; i < 38; i++) {
      const a = (0.15 + 0.7 * rand(`${seed}a${i}`)) * Math.PI;
      const rr = 60 + 40 * rand(`${seed}r${i}`);
      dots.push(<circle key={i} cx={dx + Math.cos(a) * rr * 0.95} cy={14 + Math.sin(a) * rr * 0.9} r={2.6} fill={shade(c, 0.6)} opacity={0.4} />);
    }
    return <g>{dots}</g>;
  }
  if (look.facial === "beard")
    return <path d={`M ${dx - 96} 10 C ${dx - 96} 112 ${dx + 96} 112 ${dx + 96} 10 C ${dx + 76} 46 ${dx + 50} 30 ${dx + 30} 34 Q ${dx} 30 ${dx - 30} 34 C ${dx - 50} 30 ${dx - 76} 46 ${dx - 96} 10 Z`} fill={c} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />;
  if (look.facial === "moustache")
    return <path d={`M ${dx - 44} 44 Q ${dx - 22} 18 ${dx} 32 Q ${dx + 22} 18 ${dx + 44} 44 Q ${dx + 20} 38 ${dx} 42 Q ${dx - 20} 38 ${dx - 44} 44 Z`} fill={c} stroke={INK} strokeWidth={lw * 0.8} strokeLinejoin="round" />;
  return null;
};

// ── the torso: one costume block with its details ────────────────────────────
const TORSO = "M -70 -362 Q -84 -360 -90 -330 L -84 -172 Q 0 -160 84 -172 L 90 -330 Q 84 -360 70 -362 Z";

const Torso: React.FC<{ look: Look; lw: number; back?: boolean }> = ({ look, lw, back }) => {
  const base = look.outfit === "lab_coat" ? "#ecebe5" : COLOR[look.outfitColor];
  const inner = COLOR[look.outfitColor];
  const s = { stroke: INK, strokeWidth: lw, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const thin = { ...s, strokeWidth: lw * 0.6 };
  const details: React.ReactNode[] = [];
  if (!back) {
    switch (look.outfit) {
      case "uniform":
        details.push(
          <path key="c" d="M -40 -362 L 0 -322 L 40 -362" fill="none" {...thin} />,
          <rect key="p1" x={-66} y={-318} width={40} height={42} fill="none" {...thin} />,
          <rect key="p2" x={26} y={-318} width={40} height={42} fill="none" {...thin} />,
          <path key="b" d="M 36 -312 L 56 -312 L 56 -296 Q 46 -286 36 -296 Z" fill="#d8b04a" {...thin} />,
          <line key="z" x1={0} x2={0} y1={-322} y2={-196} {...thin} />,
        );
        break;
      case "jumpsuit":
        details.push(
          <path key="v" d="M -36 -362 L 0 -318 L 36 -362 Z" fill="#ecebe5" {...thin} />,
          <line key="z" x1={0} x2={0} y1={-318} y2={-172} {...thin} />,
          <rect key="n" x={22} y={-300} width={50} height={18} fill="#ecebe5" {...thin} />,
        );
        break;
      case "suit":
        details.push(
          <path key="w" d="M -40 -362 L 0 -270 L 40 -362 Z" fill="#ecebe5" {...thin} />,
          <path key="t" d="M -10 -352 L 10 -352 L 14 -290 L 0 -272 L -14 -290 Z" fill="#b2342b" {...thin} />,
          <path key="l1" d="M -40 -362 L -22 -300 L 0 -256" fill="none" {...thin} />,
          <path key="l2" d="M 40 -362 L 22 -300 L 0 -256" fill="none" {...thin} />,
        );
        break;
      case "hoodie":
        details.push(
          <path key="p" d="M -50 -240 L 50 -240 L 64 -186 L -64 -186 Z" fill={shade(base, 0.85)} {...thin} />,
          <line key="s1" x1={-18} x2={-20} y1={-356} y2={-300} {...thin} />,
          <line key="s2" x1={18} x2={20} y1={-356} y2={-300} {...thin} />,
        );
        break;
      case "tshirt":
        details.push(<path key="n" d="M -34 -362 Q 0 -332 34 -362" fill="none" {...thin} />);
        break;
      case "lab_coat":
        details.push(
          <path key="w" d="M -36 -362 L 0 -292 L 36 -362 Z" fill={inner} {...thin} />,
          <path key="l" d="M -36 -362 L -14 -300 L 0 -292 L 0 -172" fill="none" {...thin} />,
          <path key="r" d="M 36 -362 L 14 -300 L 0 -292" fill="none" {...thin} />,
          <rect key="k" x={34} y={-300} width={36} height={34} fill="none" {...thin} />,
          <line key="pen" x1={46} x2={46} y1={-312} y2={-292} stroke="#3f6fb5" strokeWidth={lw * 0.9} strokeLinecap="round" />,
        );
        break;
      case "apron":
        details.push(
          <path key="a" d="M -50 -320 L 50 -320 L 62 -172 L -62 -172 Z" fill="#ecebe5" {...thin} />,
          <line key="s1" x1={-50} x2={-60} y1={-320} y2={-362} {...thin} />,
          <line key="s2" x1={50} x2={60} y1={-320} y2={-362} {...thin} />,
          <rect key="k" x={-30} y={-250} width={60} height={34} fill="none" {...thin} />,
        );
        break;
      case "dress":
        details.push(<path key="n" d="M -34 -362 Q 0 -326 34 -362" fill="none" {...thin} />);
        break;
    }
  }
  if (look.outfit === "uniform") details.push(<rect key="belt" x={-86} y={-196} width={172} height={22} fill={INK} />, <rect key="buckle" x={-14} y={-194} width={28} height={18} fill="#b8b8b4" />);
  return (
    <g>
      {look.outfit === "hoodie" ? <ellipse cx={0} cy={-366} rx={90} ry={30} fill={shade(base, 0.85)} {...s} /> : null}
      {look.outfit === "dress" ? <path d="M -84 -190 L -130 -70 Q 0 -50 130 -70 L 84 -190 Z" fill={base} {...s} /> : null}
      <path d={TORSO} fill={base} />
      <path d="M 44 -360 Q 84 -352 90 -330 L 84 -172 Q 66 -168 50 -167 Z" fill={shade(base, 0.82)} />
      {details}
      <path d={TORSO} fill="none" {...s} />
    </g>
  );
};

// ── seats ─────────────────────────────────────────────────────────────────────
const Seat: React.FC<{ kind: SeatKind; lw: number }> = ({ kind, lw }) => {
  const s = { stroke: INK, strokeWidth: lw, strokeLinejoin: "round" as const };
  switch (kind) {
    case "cot":
      return (
        <g>
          <rect x={-200} y={-118} width={440} height={50} rx={14} fill="#8c8b72" {...s} />
          <rect x={-200} y={-68} width={440} height={16} fill="#5d605a" {...s} />
          <line x1={-190} x2={-190} y1={-52} y2={0} {...s} strokeWidth={lw * 1.6} />
          <line x1={230} x2={230} y1={-52} y2={0} {...s} strokeWidth={lw * 1.6} />
          <path d="M -230 -130 L -180 -150 L -150 -110 L -200 -98 Z" fill="#d9d2b2" {...s} />
        </g>
      );
    case "sofa":
      return (
        <g>
          <rect x={-230} y={-260} width={460} height={150} rx={30} fill="#5e6f7c" {...s} />
          <rect x={-240} y={-122} width={480} height={84} rx={20} fill="#6b7d8b" {...s} />
          <rect x={-270} y={-200} width={60} height={170} rx={24} fill="#5e6f7c" {...s} />
          <rect x={210} y={-200} width={60} height={170} rx={24} fill="#5e6f7c" {...s} />
        </g>
      );
    case "chair":
      return (
        <g>
          <rect x={-120} y={-320} width={70} height={220} rx={20} fill="#33383d" {...s} />
          <rect x={-120} y={-120} width={220} height={36} rx={12} fill="#3f454b" {...s} />
          <line x1={-10} x2={-10} y1={-84} y2={-20} {...s} strokeWidth={lw * 2} />
          <path d="M -80 -10 L 60 -10" {...s} strokeWidth={lw * 2} strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g>
          <rect x={-210} y={-250} width={420} height={26} fill="#7b5a3c" {...s} />
          <rect x={-210} y={-210} width={420} height={26} fill="#7b5a3c" {...s} />
          <rect x={-220} y={-120} width={440} height={30} fill="#8b6a4b" {...s} />
          <line x1={-190} x2={-190} y1={-224} y2={0} {...s} strokeWidth={lw * 1.8} />
          <line x1={190} x2={190} y1={-224} y2={0} {...s} strokeWidth={lw * 1.8} />
        </g>
      );
  }
};

// ── the whole character ───────────────────────────────────────────────────────
export type CharacterProps = {
  seed: string;
  look: Look;
  pose: Pose;
  face: Face;
  front: boolean; // facing the camera rather than to the side
  mouth: Mouth;
  talking: boolean;
  blink: boolean;
  frame: number;
  lw: number;
  seat: SeatKind | null;
  back?: boolean;
  walkPhase?: number;
};

const Limb: React.FC<{ pts: P[]; color: string | null; lw: number; width: number }> = ({ pts, color, lw, width }) => {
  const d = `M ${pts.map((p) => `${p[0]} ${p[1]}`).join(" L ")}`;
  if (!color) return <path d={d} fill="none" stroke={INK} strokeWidth={lw * 1.7} strokeLinecap="round" strokeLinejoin="round" />;
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={width + lw * 2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

const Shoe: React.FC<{ x: number; y: number; dir: number; lw: number }> = ({ x, y, dir, lw }) => (
  <path d={`M ${x - 26 * dir} ${y} Q ${x - 28 * dir} ${y - 30} ${x + 4 * dir} ${y - 30} Q ${x + 40 * dir} ${y - 28} ${x + 42 * dir} ${y} Z`} fill={INK} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />
);

const Arm: React.FC<{ a: ArmPose; lw: number }> = ({ a, lw }) => {
  const sh: P = [a.elbow[0] > 0 ? 70 : -70, SH_Y];
  return (
    <g>
      <path d={`M ${sh[0]} ${sh[1]} L ${a.elbow[0]} ${a.elbow[1]} L ${a.hand[0]} ${a.hand[1]}`} fill="none" stroke={INK} strokeWidth={lw * 1.7} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={a.hand[0]} cy={a.hand[1]} r={17} fill={INK} />
      {a.finger ? <line x1={a.hand[0]} y1={a.hand[1]} x2={a.hand[0] + a.finger[0]} y2={a.hand[1] + a.finger[1]} stroke={INK} strokeWidth={lw * 1.6} strokeLinecap="round" /> : null}
    </g>
  );
};

export const Character: React.FC<CharacterProps> = (c) => {
  const { look, lw } = c;
  const skin = SKIN[look.skin];
  const sitting = c.seat !== null && (c.pose === "sit" || c.pose === "sit_relaxed");
  const drop = sitting ? SIT_DROP : 0;
  const trousers = look.outfit === "dress" ? null : TROUSERS[look.outfit] ?? (look.outfit === "jumpsuit" ? COLOR[look.outfitColor] : shade(COLOR[look.outfitColor], 0.78));
  const { lead, far, farBehindHead } = arms(c.pose, c.frame, c.talking);
  const hipY = HIP_Y + drop;
  const legW = 46;

  // legs
  let legs: React.ReactNode;
  if (c.back) {
    const w = Math.sin(c.walkPhase ?? 0);
    const l: P[] = [[-36, hipY], [-40 - 18 * w, -16 + Math.max(0, w) * -26]];
    const r: P[] = [[36, hipY], [40 + 18 * w, -16 + Math.max(0, -w) * -26]];
    legs = (
      <g>
        <Limb pts={l} color={trousers} lw={lw} width={legW} />
        <Limb pts={r} color={trousers} lw={lw} width={legW} />
        <ellipse cx={l[1][0]} cy={l[1][1] + 4} rx={30} ry={20} fill={INK} />
        <ellipse cx={r[1][0]} cy={r[1][1] + 4} rx={30} ry={20} fill={INK} />
      </g>
    );
  } else if (sitting) {
    const knee = c.pose === "sit_relaxed" ? 150 : 128;
    const footY = c.pose === "sit_relaxed" ? -40 : -12;
    const footX = c.pose === "sit_relaxed" ? knee + 70 : knee + 10;
    legs = (
      <g>
        {[-30, 30].map((dx, i) => (
          <g key={i}>
            <Limb pts={[[dx, hipY], [knee + dx * 0.4, hipY - 6], [footX + dx * 0.4, footY - 18]]} color={trousers} lw={lw} width={legW} />
            <Shoe x={footX + dx * 0.4} y={footY} dir={1} lw={lw} />
          </g>
        ))}
      </g>
    );
  } else {
    const dir = c.front ? 0 : 1;
    legs = (
      <g>
        <Limb pts={[[-36, hipY], [-48, -24]]} color={trousers} lw={lw} width={legW} />
        <Limb pts={[[36, hipY], [48, -24]]} color={trousers} lw={lw} width={legW} />
        <Shoe x={-52 + (dir ? 6 : -10)} y={0} dir={dir ? 1 : -1} lw={lw} />
        <Shoe x={52 + (dir ? 6 : 10)} y={0} dir={1} lw={lw} />
      </g>
    );
  }

  // face
  const parts = FACE_PARTS[c.face];
  const dx = c.front ? 0 : 16;
  const look2 = c.front ? 0 : 8;
  const eyes: EyeKind = c.blink && parts.eyes !== "happy" ? "shut" : parts.eyes;
  const talkShape = c.mouth === "rest" ? parts.mouth : parts.talk[c.mouth === "open" ? 0 : c.mouth === "o" ? 3 : 1] ?? "open";
  const browColor = look.hair === "none" || look.hair === "balding" ? (look.hair === "balding" ? HAIR[look.hairColor] : INK) : HAIR[look.hairColor];
  const browW = look.hairColor === "white" || look.hairColor === "grey" ? lw * 2.4 : lw * 1.6;

  const upper = (
    <g transform={drop ? `translate(0 ${drop})` : undefined}>
      {farBehindHead && !c.back ? <Arm a={far} lw={lw} /> : null}
      <Torso look={look} lw={lw} back={c.back} />
      {!farBehindHead && !c.back ? <Arm a={far} lw={lw} /> : null}
      {c.back ? <><Arm a={STAND_FAR} lw={lw} /><Arm a={STAND_LEAD} lw={lw} /></> : null}
      <g transform={`translate(0 ${HEAD_Y})`}>
        <HairBack look={look} lw={lw} />
        {/* ears */}
        <circle cx={-106} cy={6} r={20} fill={skin} stroke={INK} strokeWidth={lw} />
        <circle cx={106} cy={6} r={20} fill={skin} stroke={INK} strokeWidth={lw} />
        <circle cx={0} cy={0} r={HEAD_R} fill={skin} />
        <path d="M 56 -94 A 110 110 0 0 1 -36 104 A 132 132 0 0 0 56 -94 Z" fill={shade(skin, 0.86)} />
        <circle cx={0} cy={0} r={HEAD_R} fill="none" stroke={INK} strokeWidth={lw * 1.3} />
        {c.back ? null : (
          <g>
            <FacialHair look={look} dx={dx} lw={lw} seed={c.seed} />
            <Eye kind={eyes} x={-EYE_X + dx} look={look2} skin={skin} lw={lw} />
            <Eye kind={eyes} x={EYE_X + dx} look={look2} skin={skin} lw={lw} />
            {([-1, 1] as const).map((side) => {
              const [outer, inner] = browLine(parts.brows, side === 1 ? 1 : -1);
              const ex = side * EYE_X + dx;
              return <line key={side} x1={ex + side * 24} y1={outer} x2={ex - side * 18} y2={inner} stroke={browColor} strokeWidth={browW} strokeLinecap="round" />;
            })}
            <MouthPath shape={talkShape} dx={dx + 4} lw={lw} />
            {look.facial === "moustache" ? <FacialHair look={look} dx={dx} lw={lw} seed={c.seed} /> : null}
          </g>
        )}
        <HairFront look={look} lw={lw} back={c.back} />
        <HatDraw look={look} lw={lw} back={c.back} />
      </g>
      {c.back ? null : <Arm a={lead} lw={lw} />}
    </g>
  );

  return (
    <g>
      {sitting && c.seat ? <g transform={`translate(-20 ${c.seat === "chair" ? 0 : 0})`}><Seat kind={c.seat} lw={lw} /></g> : null}
      {legs}
      {upper}
    </g>
  );
};

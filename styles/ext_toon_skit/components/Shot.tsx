/*
 * Shot: one cut of a Toon Skit video. A flat, muted cartoon set and up to three
 * round-headed characters with stick arms, framed wide, as a two-shot, as a
 * close-up of one character or as one character walking away from the camera.
 * Every scene is a hard cut to the next; there are no transitions.
 *
 * The script is the characters' dialogue, read by the one narrator voice. The
 * shot's `talk` list says who has the line from which frame; that character's
 * mouth changes shape every few frames while a word is being spoken (word
 * timings come from the video's `words`, in video frames, so the shot carries
 * its own `sceneStart`). Poses and faces switch on their frames with no tween:
 * limited animation, like a TV cartoon.
 *
 * Kept cheap on a CPU: flat fills and outlines only, no gradients, no filters,
 * no per-frame scaling unless `push` is set. No text is drawn: the captions are
 * the pipeline's.
 */
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { TimelineWord } from "@tubematic/scene-api";
import type { CastMember, Framing, ShotProps, Slot } from "./skit/contract";
import { Character, HEAD_R, HEAD_Y, SIT_DROP, type Mouth } from "./skit/character";
import { FLOOR_Y, SEAT_KIND, SET_DRAWINGS } from "./skit/sets";
import { hash } from "./skit/ink";

/** The value of a keyed list at a frame: the last key at or before it, else the first. */
function keyed<T extends { at: number }>(keys: T[], frame: number): T | undefined {
  let out: T | undefined = keys[0];
  for (const k of keys) if (k.at <= frame) out = k;
  return out;
}

function wordAt(words: TimelineWord[] | undefined, abs: number): number {
  if (!words) return -1;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (abs >= w.startFrame && abs <= w.endFrame) return i;
    if (w.startFrame > abs) break;
  }
  return -1;
}

const SLOT_X: Record<"wide" | "wide3" | "two_shot", Record<Slot, number>> = {
  wide: { left: 300, center: 540, right: 780 },
  wide3: { left: 255, center: 540, right: 825 },
  two_shot: { left: 300, center: 540, right: 780 },
};

// The wide shot is the set and the cast at 1.25 and its floor (feet at FLOOR_Y + 60), seen by a camera
// zoomed about (540, WIDE_CY): at 1.25 the feet land near y 1720, so two characters fill the frame and
// only a strip of floor shows below them. Three across get 1.1, so nobody overlaps or leaves the frame.
const WIDE_CY = 770;
const wideZoom = (n: number) => (n >= 3 ? 1.1 : 1.25);
const wideX = (x: number, z: number) => 540 + z * (x - 540);
const wideY = (y: number, z: number) => WIDE_CY + z * (y - WIDE_CY);

// The close-up: head and chest. At 3.3 the chin (HEAD_Y + HEAD_R) sits at y 1180, well above the
// captions (style.json puts them at 0.70 of the height, y 1344), the head top near a quarter of the
// way down, and the frame's bottom edge cuts just below the belt.
const CLOSE_S = 3.3;
const CLOSE_CHIN = 1180;
const CLOSE_SET = 2.4;

type Placed = { m: CastMember; x: number; base: number; scale: number };

function place(framing: Framing, cast: CastMember[], focus: CastMember | undefined, t: number): Placed[] {
  if (framing === "close" && focus) {
    const x = focus.facing === "right" ? 480 : focus.facing === "left" ? 600 : 540;
    return [{ m: focus, x, base: CLOSE_CHIN - (HEAD_Y + HEAD_R) * CLOSE_S, scale: CLOSE_S }];
  }
  if (framing === "back" && focus) {
    // walking away down the set: smaller and higher as the shot runs
    const s = 1.5 - 0.55 * t;
    return [{ m: focus, x: 540, base: 1880 - 380 * t, scale: s }];
  }
  // two-shot: a standing chin at y 1120 and a seated one near 1213, both above the captions (y 1344)
  if (framing === "two_shot") return cast.map((m) => ({ m, x: SLOT_X.two_shot[m.slot], base: 1120 - (HEAD_Y + HEAD_R) * 1.65, scale: 1.65 }));
  // three across spread wider so their bodies don't overlap; two stay closer, facing each other
  const slots = cast.length >= 3 ? SLOT_X.wide3 : SLOT_X.wide;
  const z = wideZoom(cast.length);
  return cast.map((m) => ({ m, x: wideX(slots[m.slot], z), base: wideY(FLOOR_Y + 60, z), scale: 1.25 * z }));
}

/** How a set is framed behind the characters: zoomed in for closer shots. */
function setTransform(framing: Framing, x: number, castSize: number): string | undefined {
  // the wall behind a head: the blinds' lower edge at the top, the desk and monitor at chest height
  if (framing === "close") return `translate(${540 - x * CLOSE_SET} ${1250 - 1150 * CLOSE_SET}) scale(${CLOSE_SET})`;
  if (framing === "wide") {
    const z = wideZoom(castSize);
    return `translate(${540 * (1 - z)} ${WIDE_CY * (1 - z)}) scale(${z})`;
  }
  if (framing === "two_shot") return `translate(${-540 * 0.35} ${-560}) scale(1.35)`;
  return undefined;
}

export default function Shot({ shot, words, durationInFrames }: { shot: ShotProps; words?: TimelineWord[]; durationInFrames?: number }) {
  const frame = useCurrentFrame();
  const dur = Math.max(1, durationInFrames ?? 90);
  const t = Math.min(1, frame / dur);
  const abs = (shot.sceneStart ?? 0) + frame;
  const Set = SET_DRAWINGS[shot.set] ?? SET_DRAWINGS.office;
  const focus = shot.cast.find((m) => m.id === shot.focus) ?? shot.cast[0];
  const placed = place(shot.framing, shot.cast, focus, t);
  const speaker = keyed(shot.talk ?? [], frame)?.who ?? "none";
  const wi = wordAt(words, abs);
  const push = shot.push ? 1 + 0.04 * t : 1;
  const setX = placed[0]?.x ?? 540;

  return (
    <AbsoluteFill style={{ background: "#6b6f65", overflow: "hidden" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}
        style={{ position: "absolute", inset: 0, transform: push !== 1 ? `scale(${push.toFixed(4)})` : undefined, transformOrigin: "50% 40%" }}>
        <g transform={setTransform(shot.framing, setX, shot.cast.length)}>
          <Set />
        </g>
        {placed.map(({ m, x, base, scale }) => {
          const pose = keyed(m.poses, frame)?.pose ?? "stand";
          const face = keyed(m.faces, frame)?.face ?? "neutral";
          const talking = speaker === m.id && wi >= 0;
          let mouth: Mouth = "rest";
          if (talking) {
            const w = words![wi];
            const step = Math.floor((abs - w.startFrame) / 3);
            mouth = step === 0 ? "open" : (["open", "o", "wide", "rest"] as const)[hash(`${m.id}|${wi}|${step}`) % 4];
          }
          const period = 95 + (hash(m.id) % 40);
          const blink = (frame + (hash(`${m.id}b`) % period)) % period < 3;
          const flip = m.facing === "left" && shot.framing !== "back";
          const lw = 7 / Math.sqrt(scale);
          // a seated close-up keeps the head where a standing one has it, clear of the captions
          const lift = shot.framing === "close" && (pose === "sit" || pose === "sit_relaxed") ? SIT_DROP * scale : 0;
          return (
            <g key={m.id} transform={`translate(${x} ${base - lift}) scale(${(flip ? -scale : scale).toFixed(4)} ${scale.toFixed(4)})`}>
              <Character seed={m.id} look={m.look} pose={shot.framing === "back" ? "stand" : pose} face={face}
                front={m.facing === "front"} mouth={mouth} talking={talking} blink={blink} frame={frame} lw={lw}
                seat={pose === "sit" || pose === "sit_relaxed" ? SEAT_KIND[shot.set] : null}
                back={shot.framing === "back"} walkPhase={frame / 4} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
}

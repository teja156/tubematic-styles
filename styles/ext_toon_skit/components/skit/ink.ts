// Colours and small helpers shared by the Toon Skit drawings.
import type { ColorName, HairColor, Outfit, Skin } from "./contract";

export const INK = "#141114";

export const COLOR: Record<ColorName, string> = {
  navy: "#262d42",
  orange: "#e8692a",
  grey: "#8b8e90",
  red: "#c23b2e",
  green: "#507e4b",
  blue: "#4170b4",
  mustard: "#d8a228",
  white: "#ecebe5",
  black: "#2b2b30",
  purple: "#6e4d90",
  brown: "#7b5334",
};

export const SKIN: Record<Skin, string> = {
  light: "#f0c6a2",
  tan: "#d9a073",
  brown: "#a86b45",
  deep: "#6f4529",
};

export const HAIR: Record<HairColor, string> = {
  black: "#211c1c",
  brown: "#5c3b23",
  blonde: "#dfbd68",
  red: "#b24b27",
  grey: "#b8b8b4",
  white: "#ecece7",
};

export const TROUSERS: Record<Outfit, string | null> = {
  uniform: null, // the outfit colour, darkened
  jumpsuit: null, // the outfit colour
  suit: null, // the outfit colour, darkened
  hoodie: "#3d5b84",
  tshirt: "#3d5b84",
  lab_coat: "#545962",
  apron: "#3a3a41",
  dress: null, // stick legs
};

/** Darken (k < 1) or lighten (k > 1) a #rrggbb colour. */
export function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => {
    const out = k <= 1 ? v * k : v + (255 - v) * (k - 1);
    return Math.max(0, Math.min(255, Math.round(out)));
  };
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** A stable 32-bit hash of a string: the style's only source of variety. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A seeded number in [0, 1). */
export function rand(seed: string): number {
  return (hash(seed) % 100000) / 100000;
}

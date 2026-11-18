// The Toon Skit props contract. schema.json says the same in JSON Schema, and it
// is the one write_scene_config enforces: keep the two in step.

export const SETS = ["office", "living_room", "street", "cell"] as const;
export const FRAMINGS = ["wide", "two_shot", "close", "back"] as const;
export const SLOTS = ["left", "center", "right"] as const;
export const FACINGS = ["left", "right", "front"] as const;
export const POSES = ["stand", "point", "shrug", "arms_crossed", "hand_head", "finger_up", "hands_hips", "wave", "gesture", "sit", "sit_relaxed"] as const;
export const FACES = ["neutral", "happy", "laugh", "smug", "surprised", "angry", "sceptical", "sad", "worried", "sleepy"] as const;
export const SKINS = ["light", "tan", "brown", "deep"] as const;
export const HAIRS = ["none", "short", "side_part", "spiky", "curly", "long", "bun", "balding"] as const;
export const HAIR_COLORS = ["black", "brown", "blonde", "red", "grey", "white"] as const;
export const FACIAL = ["none", "stubble", "beard", "moustache"] as const;
export const OUTFITS = ["uniform", "jumpsuit", "suit", "hoodie", "tshirt", "lab_coat", "apron", "dress"] as const;
export const COLORS = ["navy", "orange", "grey", "red", "green", "blue", "mustard", "white", "black", "purple", "brown"] as const;
export const HATS = ["none", "peaked_cap", "cap", "beanie", "hard_hat"] as const;
export const IDS = ["a", "b", "c"] as const;

export type SetName = (typeof SETS)[number];
export type Framing = (typeof FRAMINGS)[number];
export type Slot = (typeof SLOTS)[number];
export type Facing = (typeof FACINGS)[number];
export type Pose = (typeof POSES)[number];
export type Face = (typeof FACES)[number];
export type Skin = (typeof SKINS)[number];
export type Hair = (typeof HAIRS)[number];
export type HairColor = (typeof HAIR_COLORS)[number];
export type Facial = (typeof FACIAL)[number];
export type Outfit = (typeof OUTFITS)[number];
export type ColorName = (typeof COLORS)[number];
export type Hat = (typeof HATS)[number];
export type CastId = (typeof IDS)[number];

export type Look = {
  skin: Skin;
  hair: Hair;
  hairColor: HairColor;
  facial: Facial;
  outfit: Outfit;
  outfitColor: ColorName;
  hat: Hat;
  hatColor?: ColorName;
};

export type CastMember = {
  id: CastId;
  look: Look;
  slot: Slot;
  facing: Facing;
  poses: { at: number; pose: Pose }[];
  faces: { at: number; face: Face }[];
};

export type ShotProps = {
  /** the scene entry's own startFrame, so the word timings line up */
  sceneStart: number;
  set: SetName;
  framing: Framing;
  /** the one character a close or back shot shows */
  focus?: CastId;
  cast: CastMember[];
  /** who is talking from which frame of the scene; "none" for silence or a narrator aside */
  talk: { at: number; who: CastId | "none" }[];
  push?: boolean;
};

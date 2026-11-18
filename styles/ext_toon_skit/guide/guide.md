# Toon Skit: how to write a video in it

## What it looks like

A quick comic skit. Two (at most three) flat cartoon characters with big round heads, thick black
outlines, black stick arms with mitten hands and round black shoes talk in a muted, grey-toned set: an
office, a living room, a street or a prison cell. Their costumes are the brightest thing on screen.

The picture **follows the speaker**:
- **Cuts:** hard cuts every 1 to 4 seconds (about 2.5 s on average) between a wide shot, a two-shot, a
  close-up of whoever has the line and, at the end, a back view of someone walking away.
- **Animation:** limited, like a TV cartoon. Poses and faces switch on their frames with no in-betweens,
  the speaker's mouth flaps while words are spoken, and everyone blinks now and then.
- **Captions:** the pipeline draws them, one word at a time, in white outlined capitals across the
  characters' chests (70% of the way down, below every chin).
- **No other text:** the scenes draw no text at all.

## The script it expects

- The whole script is the characters' dialogue, read by the one narrator voice.
- Lines are short (2 to 12 words), with one speaker per line and no "he said" tags.
- The shape is a premise, then a reversal, then a punchline.
- Each beat's `visual` names the speaker, the framing, the set and the face.

## The scenes

Every scene is one shot (one cut), back to back from frame 0 to the last frame:

```json
{"type": "generated", "source": "external", "src": "ext_toon_skit/components/Shot",
 "startFrame": 120, "durationInFrames": 60,
 "transitionToNext": {"durationInFrames": 0}, "props": {"shot": {...}}}
```

**Every scene needs `"transitionToNext": {"durationInFrames": 0}`, the last one included.** This style
uses hard cuts only. Leave the key out and the pipeline crossfades each shot into the next for 8
frames, which shows as a dip to black on every cut.

`props.shot`:

- **`sceneStart`:** copy the scene's `startFrame` exactly. The mouth flaps on the video's word timings,
  so a wrong value makes mouths move on the wrong words.
- **`set`:** `office`, `living_room`, `street` or `cell`. Keep one set while the story stays in one
  place.
- **`framing`:**
  - `wide`: everyone, full length (the setup, an entrance, a group reaction).
  - `two_shot`: two characters, closer than the wide and still full length (a quick exchange).
  - `close`: the `focus` character, head and chest (the line that lands, a reaction, the punchline).
  - `back`: the `focus` character walking away (the exit, the ending).
  - `close` and `back` need `focus` and draw only that character.
- **`cast`:** 1 to 3 characters; a `two_shot` holds at most 2. Each character has:
  - **`id`:** `a`, `b` or `c`, the same for that character all video.
  - **`look`:** `skin`, `hair`, `hairColor`, `facial`, `outfit`, `outfitColor`, `hat`, optional
    `hatColor`.
    - **Decide each character's look once and copy it unchanged into every scene.** A changed colour
      reads as a new person.
    - Make the characters differ at a glance: different outfit colours and different hair or hat.
    - Pick bright outfit colours (orange, red, mustard, green, blue, purple) against the muted set.
    - Costume says role: `uniform` + `peaked_cap` for a guard or officer, `lab_coat` for a doctor or
      scientist, `apron` for a cook or shopkeeper, `suit` for a boss, `jumpsuit` for an inmate or
      mechanic, `hoodie` or `tshirt` for anyone, `hard_hat` for a builder.
  - **`slot`:** `left`, `center` or `right`, used by wide and two-shots. Keep each character on the
    same side all video, so cuts keep screen direction.
  - **`facing`:** the left character faces `right`, the right one faces `left`, and `front` looks at
    camera. In a close-up, the side they face sets where they stand, so keep it the same as in the
    wide.
  - **`poses`:** `[{at, pose}]`, 1 to 6 entries, the first at 0. Each pose switches on its frame.
    - `stand`, `point` (arm out at the other person), `shrug`.
    - `arms_crossed` (stubborn), `hand_head` (embarrassed, thinking), `finger_up` ("one thing…"),
      `hands_hips` (bossy).
    - `wave`, `gesture` (forearm out, bobbing as they talk).
    - `sit` and `sit_relaxed` put them on the set's seat: a cot, an office chair, a sofa or a bench.
  - **`faces`:** `[{at, face}]`, 1 to 6 entries, the first at 0. `neutral`, `happy`, `laugh`, `smug`,
    `surprised`, `angry`, `sceptical`, `sad`, `worried`, `sleepy`.
- **`talk`:** `[{at, who}]`, 1 to 8 entries, the first at 0.
  - `who` is the id of the character whose line it is, or `none` (a pause, a reaction beat).
  - Their mouth moves only while a word is being spoken.
- **`push`:** optional, a slow 4% push in. Use it on at most one or two tense shots (the punchline).

## Timing to the narration

1. Get word timings with `get_timeline`. Split the narration into lines: one speaker each, usually
   one sentence.
2. Give each line at least one shot. **Cut on the first word of a line**: the scene starts on that
   word's `startFrame`, minus 2 frames.
3. A shot is usually 1 to 4 seconds (30 to 120 frames). Never hold one more than about 6 seconds:
   cut to the listener's reaction in the middle of a long line, with the same `talk` speaker but
   only the listener on screen, as a close-up of them. The speaker's mouth then has nobody to move.
4. When two lines share one wide or two-shot, add a `talk` entry at the second line's first word
   (frames counted from the scene's start).
5. Change a face on the word that earns it, for example `surprised` on "promoted?" and `smug` on
   the punchline. The listener's reaction can switch 4 to 8 frames after the word lands.

## Opening, turn, payoff, ending

- **Opening:** scene 1 is a `wide` of the set from frame 0, with both characters in place and the
  first speaker already talking.
- **Turn:** on the word that flips the story, cut to a `close` of the character it lands on, with
  their face switching on that word.
- **Payoff:** a `close` of whoever says the punchline, `smug` or `laugh`, with optional `push`.
- **Ending:** a `back` view of one character walking away, or a `wide` holding the last reaction, to
  the last frame. No closing card.

## Never

- No text, signs, logos, brands or real people.
- No character that looks like a known cartoon or show character. Build every character from the
  parts above.
- No more than 3 characters in the whole video.

## Look before you submit

Call `preview_frames` on:
- frame 0;
- the first frame of the turn's close-up;
- a frame in the middle of the payoff;
- the last frame.

Check five things:
1. The speaker is the one on screen while their line is spoken.
2. Each character looks the same in every shot.
3. No caption sits over a face.
4. Nobody is cut off at the frame edge in a wide shot.
5. Every scene in the config has `"transitionToNext": {"durationInFrames": 0}`, so no cut dips to black.

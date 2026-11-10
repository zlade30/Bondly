# Prompt: relationship journeys for Bondly

Paste everything inside the box below into ChatGPT. Run it **once per
relationship, each in a new chat**, changing only the `RELATIONSHIP` line each
time. Don't ask for all six at once: ChatGPT then tends to generate them with
a script, and the lessons come out templated.

- `partner` — My partner
- `dating` — Dating & new love
- `family` — My family
- `friends` — My friendships
- `work` — People at work
- `self` — How I show up in general

Save each reply as a `.json` file (for example `partner.json`) and send them
back to Claude.

## Adding a journey to the app

1. Save the file as `src/features/learn/journeys/<relationship>.json`.
2. Check it: `node scripts/check-journey.mjs src/features/learn/journeys/partner.json`
   (fix or re-run ChatGPT until it says "looks good").
3. In `src/features/learn/journeys/index.ts`, import it and add it to `FILES`.

People who chose that relationship in onboarding then see it first on Home and
Learn, Today's lesson follows it, and the skill courses come after.

---

```text
You are writing lessons for Bondly, a friendly mobile app that teaches everyday
relationship skills in short, playful lessons (like Duolingo, but for
relationships). Cute blob mascots called "Bondlings" guide each lesson.

RELATIONSHIP: partner
(one of: partner = "My partner", dating = "Dating & new love", family = "My family",
friends = "My friendships", work = "People at work", self = "How I show up in general")

TASK
Write ONE learning journey for this relationship: 10 lessons that build on each
other, from easy foundations to deeper skills. Every scenario, example, name and
choice must fit THIS relationship specifically (e.g. a partner journey talks about
partners and shared homes; a work journey talks about managers, teammates and
meetings; a family journey covers parents, siblings, in-laws and grown-up children).
The "self" journey is about the person's own patterns across all relationships
(self-awareness, needs, boundaries, self-talk, how they show up).

Cover these six skill areas across the 10 lessons, tagging each lesson with ONE:
communication, trust, boundaries, conflict, connection, listening.
Use every area at least once.

AUDIENCE AND VOICE
- Adults 18+, any gender, any orientation, any culture. Keep partners and names
  gender-neutral or varied, and use diverse, everyday names.
- Warm, encouraging, practical, a little playful. Never preachy, clinical or
  judgemental. Plain words, short sentences.
- British spelling (behaviour, apologise, judgement).
- Use curly apostrophes and quotes: ’ “ ” (not ' or ").
- Bondly is NOT therapy or professional advice. Don't diagnose or use clinical
  labels. Base advice on widely accepted, evidence-informed relationship skills
  (for example "I" statements, reflective listening, repair attempts, bids for
  connection, clear boundaries, taking breaks when flooded).
- Safety: where control, abuse, threats or feeling unsafe could come up
  (especially partner, dating and family), include one gentle "read" step in the
  most relevant lesson saying healthy relationships never involve fear, control or
  harm, and that talking to someone they trust or a local support line can help.
  Don't give hotline numbers (they vary by country).

LESSON SHAPE
Each lesson takes 3 to 5 minutes and has 5 to 7 steps, in an order like:
1-2 "read" steps (teach the idea), 1-2 "choice" steps (a realistic scenario),
1 "blank" step (complete a useful phrase), 1 "reflect" step (personal, no right
answer), optionally 1 "write" step, and it ALWAYS ends with a "try" step: one
small, specific, doable action for today.

STEP TYPES (use exactly these fields)
- read:    { "kind": "read", "title": string (max 45 chars), "body": string (max 220 chars), "mood": MOOD }
- choice:  { "kind": "choice", "prompt": string (max 160 chars),
             "options": [ { "text": string (max 90 chars), "correct": true (only on the ONE best option), "why": string (max 110 chars) }, ... 3 options ] }
           Wrong options should be tempting and realistic, never silly. Every option needs a kind "why".
- blank:   { "kind": "blank", "prompt": string (max 40 chars), "before": string, "after": string,
             "words": [3 short options], "answer": one of "words", "why": string (max 110 chars) }
           "before" + answer + "after" must read as one natural sentence.
- reflect: { "kind": "reflect", "prompt": string (max 90 chars), "options": [3 or 4 short answers, max 30 chars each],
             "reply": string (max 110 chars, warm, fits every option) }
- write:   { "kind": "write", "prompt": string (max 90 chars), "placeholder": string (max 60 chars) }
           Use at most once per lesson, and only where writing genuinely helps.
- try:     { "kind": "try", "body": string (max 140 chars) }   ← always the last step

MOOD must be one of: happy, content, neutral, sad, upset, curious, sleepy, wink.
Match the mood to the step (e.g. "sad" when describing a painful pattern, "curious"
when introducing an idea, "content" for the healthy alternative).

OUTPUT
Reply with ONLY valid JSON (no markdown fences, no commentary), in this shape:

{
  "relationship": "partner",
  "journeyTitle": string (max 28 chars, warm, e.g. "Grow Closer Together"),
  "journeyIntro": string (max 140 chars, who it's for and what they'll gain),
  "lessons": [
    {
      "id": "partner-1",
      "title": string (max 28 chars),
      "minutes": 3 | 4 | 5,
      "focus": "communication" | "trust" | "boundaries" | "conflict" | "connection" | "listening",
      "summary": string (max 70 chars, one line that makes them want to start),
      "steps": [ ...steps as above... ]
    }
    ... 10 lessons, ids partner-1 to partner-10 (use the RELATIONSHIP value as the prefix)
  ]
}

WRITE IT BY HAND (this matters most)
- Do NOT use code, a script or a template to generate the lessons. Write each
  lesson individually, like an editor writing for real people.
- Never reuse a sentence. Every "body", "prompt", "reply" and "why" must be
  written fresh for that exact lesson and option.
- Each "why" explains THAT specific option in THAT situation (what it would
  likely cause or achieve), not a general rule. Bad: "It may feel tempting, but
  it can create more distance." Good: "“Never” turns one evening into a verdict
  on them, so they defend themselves instead of helping."
- Each "reflect" step asks a different, specific question tied to the lesson
  (not "What feels most challenging?"), with options that fit that question.
- "read" steps must teach something: an idea, a reason, an example phrase, a
  common trap. Never a step that only restates the scenario or the question.
- Vary the order and number of step types between lessons so they don't feel
  identical (but always end with "try").

QUALITY CHECK BEFORE YOU ANSWER
- 10 lessons, ids numbered in order, all six skill areas used.
- Every lesson ends with a "try" step and has exactly one correct option per "choice".
- No two lessons teach the same thing; later lessons build on earlier ones.
- Every scenario clearly belongs to this relationship.
- All limits respected; British spelling; curly quotes; valid JSON.
- No sentence appears twice anywhere in the journey; every "why" is specific to its option.
```

import { tryIt, type LessonStep } from '../lesson-types';

export const COMMUNICATION: Record<string, LessonStep[]> = {
  'comm-1': [
    {
      kind: 'read',
      title: 'Blame puts people on guard',
      body: '“You never listen!” sounds like an attack. When people feel attacked, they defend themselves instead of hearing you.',
      mood: 'sad',
    },
    {
      kind: 'read',
      title: 'Try an “I feel” statement',
      body: 'Name the feeling, the moment, and what you need:\n\n“I feel ___ when ___. Could we ___?”\n\nIt shares your experience without accusing anyone.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'Which one is an “I feel” statement?',
      options: [
        { text: 'You always ignore my texts.', why: '“You always…” sounds like blame, so it invites a defence.' },
        {
          text: 'I feel lonely when my texts go unanswered all day. Could we check in at lunch?',
          correct: true,
          why: 'A feeling, a moment and a clear, kind request. That’s the whole formula.',
        },
        { text: 'Whatever, it’s fine.', why: 'Hiding the feeling means the other person never gets a chance to respond to it.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Fill in the feeling.',
      before: 'I feel',
      after: 'when plans change at the last minute.',
      words: ['anxious', 'you’re selfish', 'always'],
      answer: 'anxious',
      why: 'Feelings are words like anxious, hurt or lonely. “You’re selfish” is a judgement in disguise.',
    },
    {
      kind: 'write',
      prompt: 'Think of something small that bothered you this week. How could you say it with “I feel”?',
      placeholder: 'I feel… when… Could we…?',
    },
    tryIt('Pick one low-stakes moment today and use the formula. Starting small makes it feel natural faster.'),
  ],

  'comm-2': [
    {
      kind: 'read',
      title: 'Mind-reading misfires',
      body: 'When someone goes quiet, your brain fills in a story: they’re angry, bored, done with you. Often that story is wrong.',
      mood: 'curious',
    },
    {
      kind: 'read',
      title: 'Swap the story for a question',
      body: '“You seem quiet. What’s on your mind?” gives them room to tell you what’s really going on, instead of reacting to a guess.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'Your friend cancels plans for the second time. What’s the best first step?',
      options: [
        { text: 'Assume they don’t value you and stop inviting them.', why: 'That acts on a story you haven’t checked yet.' },
        {
          text: 'Ask: “Is everything okay? I’ve missed you.”',
          correct: true,
          why: 'Curious and warm. You learn what’s happening, and they feel cared for.',
        },
        { text: 'Cancel on them next time so they know how it feels.', why: 'Payback escalates things and teaches nothing.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Pick the most curious opener.',
      before: '',
      after: 'was that like for you?',
      words: ['What', 'Why didn’t you', 'Obviously'],
      answer: 'What',
      why: '“What” and “how” invite a story. “Why didn’t you…” can sound like an accusation.',
    },
    {
      kind: 'reflect',
      prompt: 'Which story does your mind jump to most often?',
      options: ['They’re upset with me', 'They don’t care', 'I did something wrong', 'Something else'],
      reply: 'Noticing your go-to story is the first step to checking it before you react.',
    },
    tryIt('Next time you catch yourself guessing what someone feels, ask one curious question instead.'),
  ],

  'comm-3': [
    {
      kind: 'read',
      title: 'Same words, different moment',
      body: 'Raising a big topic when someone is hungry, rushed or exhausted makes it much harder for them to really hear you.',
      mood: 'sleepy',
    },
    {
      kind: 'read',
      title: 'Ask for a good time',
      body: '“There’s something I’d like to talk about. Is now okay, or would tonight be better?” turns an ambush into an invitation.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'When is the best time to raise a money worry with your partner?',
      options: [
        { text: 'As they walk in the door after work.', why: 'They’re likely tired and still switching off. It’s hard to listen well then.' },
        {
          text: 'Over a relaxed weekend coffee, after asking if it’s a good time.',
          correct: true,
          why: 'Calm, unhurried, and they agreed to it. That gives the talk its best chance.',
        },
        { text: 'In front of friends, so they can weigh in.', why: 'An audience makes people defensive and private topics feel exposed.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the habit.',
      before: 'Before a big talk, check that the other person is',
      after: 'to listen.',
      words: ['ready', 'wrong', 'about'],
      answer: 'ready',
      why: 'A quick “is now a good time?” is one of the simplest, most powerful habits.',
    },
    {
      kind: 'reflect',
      prompt: 'When do you find hard conversations easiest?',
      options: ['In the morning', 'In the evening', 'On a walk', 'Over a meal'],
      reply: 'Tell the people close to you. It helps them choose a good moment too.',
    },
    tryIt('Before your next important conversation, ask “Is now a good time?” and see how it changes things.'),
  ],

  'comm-4': [
    {
      kind: 'read',
      title: 'Listening isn’t waiting to talk',
      body: 'Most of us listen while planning our reply. The other person can feel it, even if we nod along.',
      mood: 'neutral',
    },
    {
      kind: 'read',
      title: 'Reflect it back',
      body: 'Sum up what you heard before you respond: “So it sounds like you felt left out when…” Then check: “Did I get that right?”',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: '“Work was brutal. My boss criticised me in front of everyone.” What’s the best reply?',
      options: [
        { text: '“At least you have a job!”', why: 'Silver linings can make people feel their feelings don’t count.' },
        {
          text: '“That sounds humiliating. Do you want to talk about it?”',
          correct: true,
          why: 'You named the feeling and invited them to share more. That’s listening to understand.',
        },
        { text: '“My boss does that too. Last week…”', why: 'Relating is kind, but this shifts the spotlight to you too soon.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Finish the reflection.',
      before: 'So what I’m hearing is',
      after: '.',
      words: ['you felt embarrassed', 'you’re overreacting', 'let me tell you'],
      answer: 'you felt embarrassed',
      why: 'Reflecting the feeling shows you were really listening, without judging it.',
    },
    {
      kind: 'write',
      prompt: 'Who could you practise reflective listening with this week?',
      placeholder: 'A name or a moment…',
    },
    tryIt('In your next conversation, reflect back one thing before sharing your own view.'),
  ],

  'comm-5': [
    {
      kind: 'read',
      title: 'Everyone slips up',
      body: 'A sharp word, an eye-roll, a sigh. Strong relationships aren’t the ones without missteps; they’re the ones that repair quickly.',
      mood: 'sad',
    },
    {
      kind: 'read',
      title: 'Small repairs work',
      body: '“That came out wrong, can I try again?” A quick sorry, a gentle touch or a bit of humour can reset the mood in seconds.',
      mood: 'happy',
    },
    {
      kind: 'choice',
      prompt: 'You snapped at your sister because you were stressed. What’s a good repair?',
      options: [
        { text: 'Wait for her to forget about it.', why: 'Unrepaired moments tend to pile up quietly.' },
        {
          text: '“Sorry I snapped. I’m stressed, but that’s not on you.”',
          correct: true,
          why: 'You owned it, explained without excusing, and reconnected.',
        },
        { text: 'Explain why she deserved it.', why: 'Justifying turns a small moment into a bigger fight.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the repair.',
      before: 'That came out wrong. Can I',
      after: '?',
      words: ['try again', 'leave', 'win this'],
      answer: 'try again',
      why: 'Asking to try again is a simple, powerful way to hit reset.',
    },
    {
      kind: 'reflect',
      prompt: 'Which repair feels most natural to you?',
      options: ['A quick sorry', 'A hug or touch', 'A bit of humour', 'A note or message'],
      reply: 'Use what feels like you. The best repair is the one you’ll actually do.',
    },
    tryIt('Next time a moment goes sideways, try a repair within five minutes.'),
  ],
};

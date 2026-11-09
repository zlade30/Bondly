import { tryIt, type LessonStep } from '../lesson-types';

export const LISTENING: Record<string, LessonStep[]> = {
  'list-1': [
    {
      kind: 'read',
      title: 'Half-listening is easy to spot',
      body: 'Glancing at a phone, nodding while typing, a delayed “sorry, what?” People feel it instantly, and share a little less next time.',
      mood: 'sad',
    },
    {
      kind: 'read',
      title: 'Give full attention',
      body: 'Put the phone face down. Turn your body toward them. Make eye contact. Even five minutes of full attention can feel like a gift.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'Your friend starts telling you about a tough week while you’re answering emails. What shows full attention?',
      options: [
        { text: 'Keep typing and say “I’m listening.”', why: 'Words say listening; actions say something else.' },
        {
          text: 'Close the laptop, turn to them and say, “Tell me.”',
          correct: true,
          why: 'Clear body language that says they matter more than the screen.',
        },
        { text: 'Ask them to tell you later.', why: 'Sometimes fair, but “later” can mean the moment is lost.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the habit.',
      before: 'Put your phone',
      after: 'when someone is talking to you.',
      words: ['away', 'on loud', 'in your hand'],
      answer: 'away',
      why: 'Out of sight is out of mind, for your attention as well.',
    },
    {
      kind: 'reflect',
      prompt: 'What distracts you most when someone is talking?',
      options: ['My phone', 'Planning my reply', 'My own worries', 'The TV or screens'],
      reply: 'Noticing your main distraction is how you learn to set it aside.',
    },
    tryIt('In your next real conversation, put your phone out of sight for the whole chat.'),
  ],

  'list-2': [
    {
      kind: 'read',
      title: 'Show them you heard',
      body: 'Nodding is good. Saying back what you heard is better. It proves you were listening and catches misunderstandings early.',
      mood: 'curious',
    },
    {
      kind: 'read',
      title: 'Reflect, then check',
      body: '“So the deadline moved and now you’re doing two people’s work. Is that right?” Short, in your own words, then let them correct you.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: '“My mum keeps calling during work and I don’t know how to tell her to stop.” What’s a good reflection?',
      options: [
        {
          text: '“So her calls are getting in the way at work, and you’re stuck on how to raise it?”',
          correct: true,
          why: 'It sums up the situation and the feeling, and invites them to correct you.',
        },
        { text: '“Just block her number.”', why: 'Jumping to advice skips past understanding.' },
        { text: '“Mums, right? Mine’s the same.”', why: 'Relatable, but it moves the focus away from them.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the check.',
      before: 'So you’re saying the plan changed.',
      after: '?',
      words: ['Is that right', 'Got it, moving on', 'Whatever'],
      answer: 'Is that right',
      why: 'Checking gives them the chance to correct you, so you really understand.',
    },
    {
      kind: 'write',
      prompt: 'Think of something someone told you recently. How would you reflect it back?',
      placeholder: 'So it sounds like…',
    },
    tryIt('Reflect back one thing someone tells you today, then ask “Is that right?”'),
  ],

  'list-3': [
    {
      kind: 'read',
      title: 'Feelings don’t need to be fixed',
      body: '“You shouldn’t feel that way” rarely helps. Feelings make sense from the inside, even when we see things differently.',
      mood: 'sad',
    },
    {
      kind: 'read',
      title: 'Validate, don’t agree',
      body: 'Validating means “I can see why you’d feel that way.” You don’t have to agree with their view to understand their feeling.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: '“I’m so nervous about tomorrow’s presentation.” Which response validates the feeling?',
      options: [
        { text: '“Don’t be silly, you’ll be fine.”', why: 'Reassuring, but it brushes the feeling aside.' },
        {
          text: '“That makes sense. It’s a big moment. What part feels scariest?”',
          correct: true,
          why: 'It accepts the feeling and gently invites them to share more.',
        },
        { text: '“Everyone gets nervous, it’s not a big deal.”', why: 'Normalising can come across as minimising.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the validation.',
      before: 'It makes',
      after: 'that you’d feel that way.',
      words: ['sense', 'no difference', 'me angry'],
      answer: 'sense',
      why: '“It makes sense” is one of the simplest, kindest validating phrases.',
    },
    {
      kind: 'reflect',
      prompt: 'Which phrase do you tend to use when someone is upset?',
      options: ['“Don’t worry”', '“It’ll be fine”', '“At least…”', '“That sounds hard”'],
      reply: 'Try swapping in “That makes sense” next time and see how they respond.',
    },
    tryIt('When someone shares a feeling today, start your reply with “That makes sense.”'),
  ],

  'list-4': [
    {
      kind: 'read',
      title: 'The urge to fix',
      body: 'When someone we love is struggling, we rush to solve it. But often they want to feel heard first, and advice too soon can feel like dismissal.',
      mood: 'curious',
    },
    {
      kind: 'read',
      title: 'Just ask',
      body: '“Do you want ideas, or do you just need to vent?” One simple question tells you exactly what kind of support they need.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'Your partner comes home upset about a frustrating meeting. What’s the best first step?',
      options: [
        { text: 'List five ways they could handle it better.', why: 'Advice before understanding can feel like criticism.' },
        {
          text: '“That sounds frustrating. Do you want to vent, or talk solutions?”',
          correct: true,
          why: 'You validated the feeling and let them choose the support they need.',
        },
        { text: 'Change the subject to cheer them up.', why: 'Distraction can feel like their feelings are unwelcome.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the question.',
      before: 'Do you want advice, or do you just need to',
      after: '?',
      words: ['vent', 'stop', 'apologise'],
      answer: 'vent',
      why: 'Offering both options lets them choose the support they need.',
    },
    {
      kind: 'reflect',
      prompt: 'When you’re upset, what do you usually want first?',
      options: ['To be heard', 'Practical ideas', 'A hug', 'Some space'],
      reply: 'Tell the people close to you. It helps them support you the way you need.',
    },
    tryIt('Next time someone shares a problem, ask “Vent or solutions?” before offering advice.'),
  ],
};

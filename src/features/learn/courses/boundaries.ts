import { tryIt, type LessonStep } from '../lesson-types';

export const BOUNDARIES: Record<string, LessonStep[]> = {
  'bound-1': [
    {
      kind: 'read',
      title: 'Your body knows first',
      body: 'A tight chest, a sinking feeling, quiet resentment. These are often signs you’ve hit a limit before your mind admits it.',
      mood: 'curious',
    },
    {
      kind: 'read',
      title: 'Resentment is a signal',
      body: 'If you keep feeling irritated after saying yes, that’s a clue. It usually means you said yes to something you needed to say no to.',
      mood: 'neutral',
    },
    {
      kind: 'choice',
      prompt: 'Every time a coworker asks you to cover their shift, you feel a knot in your stomach. What is that most likely telling you?',
      options: [
        { text: 'You’re being selfish.', why: 'Noticing a limit isn’t selfish. It’s information.' },
        {
          text: 'You may be close to a limit worth paying attention to.',
          correct: true,
          why: 'That knot is a signal. Boundaries start with noticing it.',
        },
        { text: 'You should just ignore it.', why: 'Ignored signals tend to come back louder, often as resentment.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the idea.',
      before: 'Repeated resentment often means a',
      after: 'is being crossed.',
      words: ['boundary', 'friendship', 'deadline'],
      answer: 'boundary',
      why: 'Resentment is one of the clearest signs a boundary needs attention.',
    },
    {
      kind: 'reflect',
      prompt: 'Where do you most often say yes when you mean no?',
      options: ['At work', 'With family', 'With friends', 'With my partner'],
      reply: 'Knowing where it happens most is the first step to changing it.',
    },
    tryIt('Today, notice one moment you feel a “should” yes. Just notice it. No need to change it yet.'),
  ],

  'bound-2': [
    {
      kind: 'read',
      title: 'No is a complete sentence',
      body: 'You don’t owe a long explanation. Over-explaining invites people to argue with your reasons.',
      mood: 'wink',
    },
    {
      kind: 'read',
      title: 'Kind and clear',
      body: 'Try: warm opener, clear no, optional alternative.\n\n“Thanks for thinking of me. I can’t this weekend, but I’d love to grab coffee next week.”',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'A friend asks to borrow money again, and you don’t want to lend it. What’s a kind, clear no?',
      options: [
        {
          text: '“I care about you, but I’m not able to lend money. Can I help in another way?”',
          correct: true,
          why: 'Warm, clear, and it offers support without the thing you can’t give.',
        },
        { text: '“Um, maybe, I’ll see… things are kind of tight… I don’t know.”', why: 'A vague answer leaves the door open and the question coming back.' },
        { text: '“You always ask me for money. It’s so annoying.”', why: 'It’s clear, but the blame makes it harder for the friendship.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the kind no.',
      before: 'Thanks for asking, but I',
      after: 'this time.',
      words: ['can’t', 'might', 'should'],
      answer: 'can’t',
      why: 'Clear words like “can’t” or “won’t” leave no confusion about your answer.',
    },
    {
      kind: 'write',
      prompt: 'Think of a request you’d like to turn down. How could you say a kind, clear no?',
      placeholder: 'Thanks for… I can’t… but…',
    },
    tryIt('Say one small, kind no today, without a long explanation.'),
  ],

  'bound-3': [
    {
      kind: 'read',
      title: 'Boundaries get tested',
      body: 'When you set a new boundary, people often push on it, not always on purpose. It’s just unfamiliar to them.',
      mood: 'neutral',
    },
    {
      kind: 'read',
      title: 'Repeat calmly',
      body: 'You don’t need to get louder. Restate it, calmly and kindly, as many times as it takes:\n\n“Like I said, I don’t take work calls after 7.”',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'You asked your sibling not to drop by unannounced. They show up anyway. What holds the line kindly?',
      options: [
        { text: 'Let them in and say nothing, to avoid drama.', why: 'This teaches them the boundary doesn’t really count.' },
        { text: 'Refuse to open the door and ignore their texts.', why: 'It holds the line, but shutting them out can hurt the relationship.' },
        {
          text: '“I’m glad to see you, but I can’t hang out now. Text me first next time and we’ll plan something.”',
          correct: true,
          why: 'Warm, calm, and it restates the boundary with a clear next step.',
        },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the tip.',
      before: 'When a boundary is pushed, restate it',
      after: '.',
      words: ['calmly', 'louder', 'never'],
      answer: 'calmly',
      why: 'Calm repetition is more convincing than raising your voice.',
    },
    {
      kind: 'reflect',
      prompt: 'What makes holding a boundary hardest for you?',
      options: ['Feeling guilty', 'Fear of conflict', 'Wanting to be liked', 'Not wanting to repeat myself'],
      reply: 'That feeling is normal. It usually fades as the boundary becomes routine.',
    },
    tryIt('If a boundary gets pushed this week, restate it once, calmly, in the same words.'),
  ],

  'bound-4': [
    {
      kind: 'read',
      title: 'Boundaries go both ways',
      body: 'Wanting your limits respected means respecting other people’s too, even when their no disappoints you.',
      mood: 'content',
    },
    {
      kind: 'read',
      title: 'Take a no gracefully',
      body: 'When someone sets a boundary with you, it’s a sign they trust you enough to be honest. A simple “Thanks for telling me” goes a long way.',
      mood: 'happy',
    },
    {
      kind: 'choice',
      prompt: 'Your partner says they need a quiet night alone, but you were hoping to hang out. What’s the most respectful response?',
      options: [
        { text: '“Fine, whatever.”', why: 'The sulk makes them pay for being honest.' },
        {
          text: '“Thanks for telling me. Enjoy your night. Want to plan something tomorrow?”',
          correct: true,
          why: 'You respected their need and kept the connection warm.',
        },
        { text: '“But we never spend time together anymore!”', why: 'This turns their boundary into a guilt trip.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the respectful response.',
      before: 'Thanks for',
      after: 'me what you need.',
      words: ['telling', 'blaming', 'ignoring'],
      answer: 'telling',
      why: 'Thanking someone for their honesty makes it easier for them to be honest again.',
    },
    {
      kind: 'reflect',
      prompt: 'Whose boundaries do you find hardest to accept?',
      options: ['My partner’s', 'My family’s', 'My friends’', 'My coworkers’'],
      reply: 'Noticing this helps you pause before reacting next time.',
    },
    tryIt('Next time someone says no to you, reply with “Thanks for telling me” before anything else.'),
  ],
};

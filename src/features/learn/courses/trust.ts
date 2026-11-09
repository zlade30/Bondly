import { tryIt, type LessonStep } from '../lesson-types';

export const TRUST: Record<string, LessonStep[]> = {
  'trust-1': [
    {
      kind: 'read',
      title: 'Trust is built in small moments',
      body: 'Big gestures are nice, but trust mostly grows from tiny promises kept: texting when you said you would, showing up on time, remembering what mattered to them.',
      mood: 'content',
    },
    {
      kind: 'read',
      title: 'Promise less, keep more',
      body: 'A casual “I’ll call you later” that never happens chips away at trust. Only promise what you can actually do, then do it.',
      mood: 'curious',
    },
    {
      kind: 'choice',
      prompt: 'Your friend asks if you can help them move on Saturday, but you’re not sure you’re free. What builds the most trust?',
      options: [
        { text: '“Sure, definitely!” and hope it works out.', why: 'An easy yes that falls through hurts more than an honest maybe.' },
        {
          text: '“I want to help. Let me check and tell you by tonight.”',
          correct: true,
          why: 'Honest, warm, and it sets a small promise you can actually keep.',
        },
        { text: 'Say nothing and see if they ask again.', why: 'Silence leaves them guessing, which feels unreliable.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the trust habit.',
      before: 'Only make promises you can',
      after: '.',
      words: ['keep', 'forget', 'avoid'],
      answer: 'keep',
      why: 'Fewer promises, reliably kept, build more trust than many that slip.',
    },
    {
      kind: 'reflect',
      prompt: 'Which small promise slips most often for you?',
      options: ['Replying to messages', 'Being on time', 'Calling back', 'Following through on plans'],
      reply: 'Picking just one to get consistent with is a great place to start.',
    },
    tryIt('Make one small promise today, like “I’ll text you at 6”, and keep it exactly.'),
  ],

  'trust-2': [
    {
      kind: 'read',
      title: 'Mistakes don’t break trust. Dodging them does.',
      body: 'Everyone gets things wrong. What people remember is whether you owned it, or got defensive and made excuses.',
      mood: 'sad',
    },
    {
      kind: 'read',
      title: 'A real apology has three parts',
      body: '1. Name what you did.\n2. Show you understand how it affected them.\n3. Say what you’ll do differently.\n\nNo “but”, and no “sorry if you were upset”.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'You forgot your partner’s important work event. Which apology works best?',
      options: [
        { text: '“Sorry, but you know how busy I’ve been.”', why: 'The “but” turns the apology into an excuse.' },
        { text: '“Sorry if you feel let down.”', why: 'This puts the problem on their feelings, not your action.' },
        {
          text: '“I forgot your event, and I know you wanted me there. I’m sorry. I’ve put your next one in my calendar.”',
          correct: true,
          why: 'It names the mistake, the impact, and the change. That’s the full apology.',
        },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Which word sneaks an excuse into an apology?',
      before: 'I’m sorry,',
      after: 'I was really tired.',
      words: ['but', 'truly', 'from the heart'],
      answer: 'but',
      why: '“But” cancels out everything before it. Drop it and the apology lands.',
    },
    {
      kind: 'write',
      prompt: 'Is there an apology you’ve been putting off? How could you say it in three parts?',
      placeholder: 'I did… I know it… Next time I’ll…',
    },
    tryIt('Next time you slip up, apologise within the day, with no “but”.'),
  ],

  'trust-3': [
    {
      kind: 'read',
      title: 'Predictable feels safe',
      body: 'When people know how you’ll respond, they relax around you. Being warm one day and cold the next keeps them on edge.',
      mood: 'neutral',
    },
    {
      kind: 'read',
      title: 'Say what you mean, do what you say',
      body: 'Consistency isn’t about being boring. It’s about your words, actions and mood lining up, so people don’t have to guess.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'You’re in a bad mood after a hard day. What keeps things predictable at home?',
      options: [
        {
          text: '“Rough day, I need 20 minutes to myself. It’s not about you.”',
          correct: true,
          why: 'You explained the mood and what you need, so they don’t have to guess or take it personally.',
        },
        { text: 'Go quiet and hope nobody notices.', why: 'Unexplained silence often gets read as “I did something wrong”.' },
        { text: 'Act fine, then snap later.', why: 'The sudden switch is exactly what makes people feel unsafe.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the idea.',
      before: 'Trust grows when your words and actions',
      after: '.',
      words: ['match', 'compete', 'disappear'],
      answer: 'match',
      why: 'When what you say and what you do line up, people can rely on you.',
    },
    {
      kind: 'reflect',
      prompt: 'When are you least predictable?',
      options: ['When I’m tired', 'When I’m stressed', 'When I’m hungry', 'When I’m overwhelmed'],
      reply: 'Knowing your trigger means you can give people a heads-up when it hits.',
    },
    tryIt('When your mood dips today, name it out loud so the people around you aren’t left guessing.'),
  ],

  'trust-4': [
    {
      kind: 'read',
      title: 'Rebuilding takes time',
      body: 'After trust is broken, one apology isn’t enough. It comes back slowly, through patience, openness and repeated proof that things have changed.',
      mood: 'sad',
    },
    {
      kind: 'read',
      title: 'Openness speeds it up',
      body: 'Share more than you’re asked. Answer questions without getting defensive. Let the hurt person set the pace, and expect some hard days.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'Weeks after an apology, your friend still brings up the hurt. What helps rebuild trust?',
      options: [
        { text: '“I already said sorry. Can we move on?”', why: 'Rushing them can feel like the hurt doesn’t matter to you.' },
        {
          text: '“I get that it still hurts. I’m here to talk about it whenever you need.”',
          correct: true,
          why: 'Patience and openness show the change is real, not just words.',
        },
        { text: 'Avoid them until it blows over.', why: 'Distance feels like the same behaviour that broke trust.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the rebuilding rule.',
      before: 'Let the person who was hurt set the',
      after: '.',
      words: ['pace', 'rules for you', 'blame'],
      answer: 'pace',
      why: 'Healing can’t be rushed. Following their pace shows respect.',
    },
    {
      kind: 'reflect',
      prompt: 'What helps you trust someone again after they’ve let you down?',
      options: ['A real apology', 'Seeing changed behaviour', 'Time', 'Open, honest talks'],
      reply: 'Sharing this with people close to you helps them know how to make things right.',
    },
    tryIt('If you’re rebuilding trust with someone, offer one piece of openness today before they ask.'),
  ],
};

import { tryIt, type LessonStep } from '../lesson-types';

export const CONFLICT: Record<string, LessonStep[]> = {
  'conf-1': [
    {
      kind: 'read',
      title: 'Heat makes us worse listeners',
      body: 'When you’re flooded with anger, your heart races and your thinking narrows. It’s the worst moment to say something important.',
      mood: 'upset',
    },
    {
      kind: 'read',
      title: 'Take a real pause',
      body: '“I want to sort this out, but I need 20 minutes to calm down. Can we come back to it?” A pause with a promise to return isn’t avoidance. It’s care.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'An argument is escalating and you feel your face getting hot. What’s the best move?',
      options: [
        { text: 'Push through and win the point.', why: 'Winning while flooded usually means losing the relationship moment.' },
        { text: 'Walk out without a word.', why: 'Leaving with no explanation can feel like abandonment.' },
        {
          text: '“I’m getting too heated. Can we take 20 minutes and come back?”',
          correct: true,
          why: 'You named it, paused, and promised to return. That keeps both of you safe.',
        },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the pause.',
      before: 'Let’s take a break and',
      after: 'to this in 20 minutes.',
      words: ['come back', 'never return', 'give up'],
      answer: 'come back',
      why: 'The promise to come back is what makes a pause feel safe, not like walking away.',
    },
    {
      kind: 'reflect',
      prompt: 'What helps you calm down fastest?',
      options: ['A short walk', 'Slow breathing', 'Some quiet time', 'Music'],
      reply: 'Keep this in mind. It’s your go-to during your next pause.',
    },
    tryIt('Agree on a pause phrase with someone close to you, before the next disagreement happens.'),
  ],

  'conf-2': [
    {
      kind: 'read',
      title: 'It’s not you versus me',
      body: 'In a fight it feels like there’s a winner and a loser. But if one person “loses”, the relationship loses too.',
      mood: 'sad',
    },
    {
      kind: 'read',
      title: 'Put the problem on the table',
      body: 'Imagine the issue is sitting between you, and you’re both looking at it together. “How do we solve this?” instead of “Why do you always…?”',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'You and your roommate keep clashing over dishes. Which opener treats it as a shared problem?',
      options: [
        {
          text: '“The dishes keep piling up and it’s stressing us both out. How should we handle it?”',
          correct: true,
          why: '“Us” and “we” turn it into a problem you solve together.',
        },
        { text: '“You never wash anything.”', why: '“You never” puts them on trial, so they’ll defend instead of solve.' },
        { text: '“Fine, I’ll do everything myself, as usual.”', why: 'Martyrdom builds resentment and doesn’t fix the problem.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the shared-problem question.',
      before: 'How can',
      after: 'fix this together?',
      words: ['we', 'you', 'they'],
      answer: 'we',
      why: '“We” signals you’re on the same team.',
    },
    {
      kind: 'write',
      prompt: 'Think of a recurring disagreement. How could you phrase it as a shared problem?',
      placeholder: 'How can we…',
    },
    tryIt('In your next disagreement, use “we” at least once when describing the problem.'),
  ],

  'conf-3': [
    {
      kind: 'read',
      title: 'Some moves make every fight worse',
      body: 'Name-calling, eye-rolling, bringing up old fights, and the silent treatment turn a disagreement into a battle.',
      mood: 'upset',
    },
    {
      kind: 'read',
      title: 'Agree on fair rules',
      body: 'Stick to one topic. No insults. No “always” or “never”. Take a break if it gets too hot. Simple rules keep arguments safe for both of you.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'Mid-argument about tonight’s plans, you’re tempted to bring up something from last year. Fair or not?',
      options: [
        { text: 'Fair. It proves your point.', why: 'Old grievances widen the fight and make it harder to resolve.' },
        {
          text: 'Not fair. Stick to tonight’s plans.',
          correct: true,
          why: 'One topic at a time keeps the argument solvable.',
        },
        { text: 'Fair, as long as you say it calmly.', why: 'Calm or not, adding old issues changes the subject.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the rule.',
      before: 'Stick to',
      after: 'topic at a time.',
      words: ['one', 'every', 'their'],
      answer: 'one',
      why: 'Focusing on one issue makes it far more likely you’ll actually resolve it.',
    },
    {
      kind: 'reflect',
      prompt: 'Which unfair move do you slip into most?',
      options: ['Bringing up the past', 'Going silent', 'Raising my voice', 'Saying “always” or “never”'],
      reply: 'Honest self-awareness like this is how fights start getting fairer.',
    },
    tryIt('Share one fair-fight rule with someone close to you and agree to try it together.'),
  ],

  'conf-4': [
    {
      kind: 'read',
      title: 'Compromise isn’t losing',
      body: 'A good compromise means both people get something that matters to them. Nobody gets everything, and nobody gets nothing.',
      mood: 'neutral',
    },
    {
      kind: 'read',
      title: 'Find what matters most',
      body: 'Ask each other: “What’s the part of this you really care about?” Often the core needs fit together, even when the positions don’t.',
      mood: 'curious',
    },
    {
      kind: 'choice',
      prompt: 'You want a quiet weekend; your partner wants to see friends. What’s a good compromise?',
      options: [
        { text: 'One of you gives in completely.', why: 'That’s a win for one person, not a compromise.' },
        {
          text: 'Friends on Saturday afternoon, a quiet Sunday at home.',
          correct: true,
          why: 'You both get the part that matters most to you.',
        },
        { text: 'Skip the weekend plans entirely.', why: 'Avoiding the decision means neither of you gets what you need.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the question.',
      before: 'What part of this matters',
      after: 'to you?',
      words: ['most', 'least', 'nothing'],
      answer: 'most',
      why: 'Finding each person’s top priority makes a fair middle ground much easier.',
    },
    {
      kind: 'reflect',
      prompt: 'In disagreements, which do you tend to do?',
      options: ['Give in too quickly', 'Hold my ground too long', 'Avoid deciding', 'Usually find a middle'],
      reply: 'Knowing your pattern helps you notice when to stretch a little differently.',
    },
    tryIt('Next time you disagree on a plan, ask “What matters most to you here?” before deciding.'),
  ],
};

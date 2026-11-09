import { tryIt, type LessonStep } from '../lesson-types';

export const CONNECTION: Record<string, LessonStep[]> = {
  'conn-1': [
    {
      kind: 'read',
      title: 'Little reaches for connection',
      body: '“Look at that bird!” “Guess what happened today.” A sigh. These small moments are bids, invitations to connect.',
      mood: 'curious',
    },
    {
      kind: 'read',
      title: 'Turn toward them',
      body: 'Responding, even briefly, says “I see you.” Ignoring bids, again and again, slowly makes people stop reaching out.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'Your partner says, “Wow, look at that sunset,” while you’re on your phone. What turns toward the bid?',
      options: [
        { text: 'Keep scrolling and say “mm-hm”.', why: 'A half-response often feels like being ignored.' },
        {
          text: 'Look up and say, “Oh, that’s beautiful!”',
          correct: true,
          why: 'A few seconds of real attention is all a bid needs.',
        },
        { text: '“I’m busy right now.”', why: 'This turns away from the bid, even if it isn’t meant unkindly.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the idea.',
      before: 'Small moments of attention are how people',
      after: 'closer.',
      words: ['grow', 'drift', 'argue'],
      answer: 'grow',
      why: 'Many small turned-toward moments build closeness over time.',
    },
    {
      kind: 'reflect',
      prompt: 'What most often pulls your attention away from bids?',
      options: ['My phone', 'Work', 'Being tired', 'My own thoughts'],
      reply: 'Naming it makes it easier to set it down when someone reaches out.',
    },
    tryIt('Notice three bids today, and turn toward each one, even for a few seconds.'),
  ],

  'conn-2': [
    {
      kind: 'read',
      title: '“Fine” closes the door',
      body: '“How was your day?” “Fine.” Routine questions get routine answers. Closeness needs questions that invite a real story.',
      mood: 'neutral',
    },
    {
      kind: 'read',
      title: 'Ask open, specific questions',
      body: 'Try: “What was the best part of your day?” or “What’s been on your mind lately?” They’re easy to answer and hard to brush off.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'Which question is most likely to start a real conversation?',
      options: [
        { text: '“Good day?”', why: 'It invites a yes or no, so the chat often ends there.' },
        {
          text: '“What made you laugh today?”',
          correct: true,
          why: 'Open and specific: it invites a story, not a one-word answer.',
        },
        { text: '“Did you finish that thing?”', why: 'A task check-in, not a connection question.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Turn it into an open question.',
      before: '',
      after: 'has been on your mind lately?',
      words: ['What', 'Has anything', 'Is something'],
      answer: 'What',
      why: '“What” questions invite people to share, instead of just answering yes or no.',
    },
    {
      kind: 'write',
      prompt: 'Write one deeper question you’d like to ask someone close to you.',
      placeholder: 'What… / How…',
    },
    tryIt('Swap “How was your day?” for one open, specific question tonight.'),
  ],

  'conn-3': [
    {
      kind: 'read',
      title: 'Rituals keep you close',
      body: 'A morning coffee together, a Sunday call, a goodnight text. Small repeated rituals give connection a home in busy weeks.',
      mood: 'happy',
    },
    {
      kind: 'read',
      title: 'Small and steady wins',
      body: 'Rituals don’t need to be big. Ten minutes that reliably happen beat a grand plan that keeps getting postponed.',
      mood: 'content',
    },
    {
      kind: 'choice',
      prompt: 'You and a friend keep losing touch. Which ritual is most likely to stick?',
      options: [
        { text: 'A big trip together “sometime this year”.', why: 'Lovely idea, but vague plans are easy to postpone.' },
        {
          text: 'A 15-minute call every Sunday morning.',
          correct: true,
          why: 'Small, specific and repeatable. That’s what makes a ritual stick.',
        },
        { text: 'Messaging whenever you happen to remember.', why: 'Without a rhythm, it relies on luck.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the tip.',
      before: 'The best rituals are small and',
      after: '.',
      words: ['regular', 'expensive', 'rare'],
      answer: 'regular',
      why: 'Regularity matters more than size. It’s the rhythm that builds closeness.',
    },
    {
      kind: 'reflect',
      prompt: 'Which ritual would you most like to start?',
      options: ['A weekly call', 'A shared meal', 'A daily check-in text', 'A weekly walk'],
      reply: 'Pick a day and time for it. Rituals stick best when they’re scheduled.',
    },
    tryIt('Suggest one small ritual to someone you care about, with a specific day and time.'),
  ],

  'conn-4': [
    {
      kind: 'read',
      title: 'We notice what’s wrong',
      body: 'Our brains spot problems more easily than good things. In close relationships, appreciation can quietly fade into the background.',
      mood: 'neutral',
    },
    {
      kind: 'read',
      title: 'Make thanks specific',
      body: '“Thanks” is nice. “Thanks for making dinner when I was exhausted. It made my evening” is much nicer. Specific appreciation shows you really noticed.',
      mood: 'happy',
    },
    {
      kind: 'choice',
      prompt: 'Your sister helped you move last weekend. Which thank-you will she remember?',
      options: [
        { text: '“Thanks for the help.”', why: 'Kind, but easy to forget.' },
        {
          text: '“Thank you for giving up your Saturday. Carrying the sofa with you was the most fun part.”',
          correct: true,
          why: 'Specific and personal. It shows you noticed her effort.',
        },
        { text: 'Nothing, she knows you’re grateful.', why: 'People can’t feel appreciation that isn’t shared.' },
      ],
    },
    {
      kind: 'blank',
      prompt: 'Complete the idea.',
      before: 'The more',
      after: 'your thanks, the more it means.',
      words: ['specific', 'vague', 'rushed'],
      answer: 'specific',
      why: 'Specific appreciation shows you truly saw what they did.',
    },
    {
      kind: 'write',
      prompt: 'Who deserves a specific thank-you this week? What would you say?',
      placeholder: 'Thank you for…',
    },
    tryIt('Send one specific thank-you message today, naming exactly what they did.'),
  ],
};

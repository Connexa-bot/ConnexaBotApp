const replyRules = {
  // Regex to match greetings as whole words
  '\\b(hello|hi|hey|yo)\\b': [
    'Hello! This is an automated message. The user will get back to you shortly.',
    'Hi there! You\'ve reached an automated assistant.',
    'Hey! The user is currently unavailable, but this is their bot letting you know they received your message.'
  ],
  // Regex to match forms of thanks
  '\\b(thanks|thank you|thx)\\b': [
    'You\'re welcome!',
    'No problem!',
    'Glad I could help!'
  ],
  // Regex to match requests for help
  '\\b(help|support|assistance)\\b': [
    'This is an automated assistant. If you need help, the user has been notified and will respond as soon as possible.'
  ],
  // A catch-all for messages ending in a question mark
  '\\?$': [
      'That\'s a great question. The user will get back to you with an answer soon.',
      'Message received. The user will answer your question as soon as they can.'
  ],
  // Default fallback messages
  'default': [
    'Message received. The user will get back to you shortly.',
    'Thanks for your message. I\'ll make sure the user sees it.',
    'Got it. The user will reply when they are available.'
  ]
};

// Function to get a random element from an array
const getRandomReply = (replies) => {
    return replies[Math.floor(Math.random() * replies.length)];
}

export const getAutoReply = (message) => {
  const lowerCaseMessage = message.toLowerCase();

  for (const pattern in replyRules) {
    if (pattern === 'default') continue; // Skip the default rule for now

    const regex = new RegExp(pattern, 'i'); // 'i' for case-insensitive
    if (regex.test(lowerCaseMessage)) {
      return getRandomReply(replyRules[pattern]);
    }
  }

  // If no other pattern matched, return a random default reply
  return getRandomReply(replyRules['default']);
};
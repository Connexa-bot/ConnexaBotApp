const replyRules = {
  'hello': 'Hi there! This is an automated reply.',
  'help': 'This is a bot. The person you are trying to reach will get back to you soon.',
  'thanks': 'You\'re welcome!',
  'default': 'Message received. I will get back to you shortly.'
};

export const getAutoReply = (message) => {
  const lowerCaseMessage = message.toLowerCase();
  for (const keyword in replyRules) {
    if (lowerCaseMessage.includes(keyword)) {
      return replyRules[keyword];
    }
  }
  return null; // No reply if no keyword is matched
};
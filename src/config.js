// This file contains the application's configuration.
// By centralizing the server URL here, we can easily update it without
// changing any other part of the application.

export const SERVER_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  process.env.REACT_APP_API_URL || 
  process.env.SERVER_URL || 
  'https://1b6bc53f-e595-4c09-bbdf-56c62421c642-00-18ocnnrogz8bw.kirk.replit.dev';

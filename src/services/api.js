import axios from 'axios';
import { SERVER_URL } from '../config';

// Create an Axios client for making API requests
const apiClient = axios.create({
  baseURL: SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =================================================================
// 📞 CONNECTION & SESSION
// =================================================================

/**
 * Initiates a WhatsApp connection to get a QR or Link code.
 * Corresponds to: CONNECT_WHATSAPP
 * @param {string} phone - The user's phone number.
 * @returns {Promise} - The API response.
 */
export const connectToServer = (phone) => {
  return apiClient.post('/api/connect', { phone });
};

/**
 * Checks the WhatsApp connection status for a given phone number.
 * Corresponds to: GET_STATUS
 * @param {string} phone - The user's phone number.
 * @returns {Promise} - The API response.
 */
export const getConnectionStatus = (phone) => {
  return apiClient.get(`/api/status/${phone}`);
};

/**
 * Logs out and clears the WhatsApp session for a given phone number.
 * Corresponds to: LOGOUT_WHATSAPP
 * @param {string} phone - The user's phone number.
 * @returns {Promise} - The API response.
 */
export const logoutWhatsApp = (phone) => {
  return apiClient.post('/api/logout', { phone });
};

// =================================================================
// 💬 CHATS & MESSAGES
// =================================================================

/**
 * Fetches the list of all chats for a given phone number.
 * Corresponds to: GET_CHATS
 * @param {string} phone - The user's phone number.
 * @returns {Promise} - The API response.
 */
export const getChats = (phone) => {
  return apiClient.get(`/api/chats/${phone}`);
};

/**
 * Sends a text message to a specified recipient.
 * Corresponds to: SEND_MESSAGE
 * @param {string} phone - The sender's phone number.
 * @param {string} to - The recipient's JID.
 * @param {string} text - The message content.
 * @returns {Promise} - The API response.
 */
export const sendMessage = (phone, to, text) => {
  return apiClient.post('/api/messages/send', { phone, to, text });
};

/**
 * Performs various actions on messages (e.g., delete, forward, react).
 * Corresponds to: MESSAGE_ACTION
 * @param {object} payload - The data for the message action.
 * @returns {Promise} - The API response.
 */
export const performMessageAction = (payload) => {
  return apiClient.post('/api/messages/action', payload);
};

// =================================================================
// 👥 CONTACTS
// =================================================================

/**
 * Performs various actions on contacts (e.g., get, block, unblock).
 * Corresponds to: CONTACT_ACTION
 * @param {object} payload - The data for the contact action.
 * @returns {Promise} - The API response.
 */
export const performContactAction = (payload) => {
  return apiClient.post('/api/contacts/action', payload);
};

// =================================================================
// 👨‍👩‍👧‍👦 GROUPS
// =================================================================

/**
 * Fetches the list of all groups for a given phone number.
 * Corresponds to: GET_GROUPS
 * @param {string} phone - The user's phone number.
 * @returns {Promise} - The API response.
 */
export const getGroups = (phone) => {
  return apiClient.get(`/api/groups/${phone}`);
};

/**
 * Performs various actions on groups (e.g., create, add/remove members).
 * Corresponds to: GROUP_ACTION
 * @param {object} payload - The data for the group action.
 * @returns {Promise} - The API response.
 */
export const performGroupAction = (payload) => {
  return apiClient.post('/api/groups/action', payload);
};

// =================================================================
// 👤 PROFILE
// =================================================================

/**
 * Performs various actions on the user's profile (e.g., update name, status, picture).
 * Corresponds to: PROFILE_ACTION
 * @param {object} payload - The data for the profile action.
 * @returns {Promise} - The API response.
 */
export const performProfileAction = (payload) => {
  return apiClient.post('/api/profile/action', payload);
};

// The getStatuses and postStatus functions have been removed as they
// do not correspond to any available endpoints in Apiendpoints.js.

export default apiClient;
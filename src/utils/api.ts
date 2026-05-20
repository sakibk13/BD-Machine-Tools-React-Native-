import axios from 'axios';
import { decode, encode } from 'base-64';
// @ts-ignore
import { WC_CONSUMER_KEY, WC_CONSUMER_SECRET, WC_BASE_URL } from '@env';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

// Ensure base URL exists and has trailing slash
const baseURL = WC_BASE_URL || '';
const safeBaseURL = baseURL ? (baseURL.endsWith('/') ? baseURL : `${baseURL}/`) : '';

const api = axios.create({
  baseURL: safeBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Add Authorization header safely
if (WC_CONSUMER_KEY && WC_CONSUMER_SECRET) {
  try {
    const auth = encode(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`);
    api.defaults.headers.Authorization = `Basic ${auth}`;
  } catch (e) {
    console.error('Failed to encode API credentials:', e);
  }
}

export default api;

import axios from 'axios';
import { decode, encode } from 'base-64';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

// Use Expo's built-in process.env for maximum reliability
const WC_KEY = process.env.EXPO_PUBLIC_WC_KEY;
const WC_SECRET = process.env.EXPO_PUBLIC_WC_SECRET;
const WC_URL = process.env.EXPO_PUBLIC_WC_URL || 'https://bdmachinetools.com/wp-json/wc/v3/';

// Ensure base URL has trailing slash
const safeBaseURL = WC_URL.endsWith('/') ? WC_URL : `${WC_URL}/`;

console.log('API Initializing with URL:', safeBaseURL);

const api = axios.create({
  baseURL: safeBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Add Authorization header
if (WC_KEY && WC_SECRET) {
  try {
    const auth = encode(`${WC_KEY}:${WC_SECRET}`);
    api.defaults.headers.Authorization = `Basic ${auth}`;
    console.log('API Authorization configured.');
  } catch (e) {
    console.error('Failed to encode API credentials:', e);
  }
} else {
  console.warn('API Warning: WC_KEY or WC_SECRET is missing from environment.');
}

export default api;

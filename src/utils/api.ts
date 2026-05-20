import axios from 'axios';
import { decode, encode } from 'base-64';
// @ts-ignore
import { 
  EXPO_PUBLIC_WC_KEY, 
  EXPO_PUBLIC_WC_SECRET, 
  EXPO_PUBLIC_WC_URL 
} from '@env';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

// prioritize @env (dotenv) then process.env (expo public) then hardcoded fallback
const WC_KEY = EXPO_PUBLIC_WC_KEY || process.env.EXPO_PUBLIC_WC_KEY;
const WC_SECRET = EXPO_PUBLIC_WC_SECRET || process.env.EXPO_PUBLIC_WC_SECRET;
const WC_URL = EXPO_PUBLIC_WC_URL || process.env.EXPO_PUBLIC_WC_URL || 'https://bdmachinetools.com/wp-json/wc/v3/';

// Ensure base URL has trailing slash
const safeBaseURL = WC_URL.endsWith('/') ? WC_URL : `${WC_URL}/`;

console.log('API Initializing...', {
  url: safeBaseURL,
  keyLoaded: !!WC_KEY,
  secretLoaded: !!WC_SECRET
});

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
    console.log('API: Basic Auth Header set.');
  } catch (e) {
    console.error('API Error: Encoding failed', e);
  }
} else {
  console.warn('API Critical: Missing WC_KEY or WC_SECRET in .env');
}

export default api;

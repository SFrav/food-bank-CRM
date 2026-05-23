import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://127.0.0.1:54321'; // Local default

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!SUPABASE_URL) {
  throw new Error(
    'Supabase URL is missing. Set VITE_SUPABASE_URL in your .env file.'
  );
}

if (!SUPABASE_KEY) {
  throw new Error(
    'Supabase key is missing. Set VITE_SUPABASE_PUBLISHABLE_KEY (cloud) or VITE_SUPABASE_ANON_KEY (local) in your .env file.'
  );
}

/**
 * Supabase client instance.
 * - persistSession: keeps the user logged in across page reloads.
 * - detectSessionInUrl: reads auth tokens from the URL on initial load.
 * - flowType: PKCE is recommended for SPA and serverless deployments.
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
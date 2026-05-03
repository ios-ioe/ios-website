// Configuration (UMD global from https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2 — load that script before any module that imports this file)
const SUPABASE_URL = window.SUPABASE_URL || 'https://qcyvpxulluzrxfedsdfg.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjeXZweHVsbHV6cnhmZWRzZGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjQ0NDgsImV4cCI6MjA5MzI0MDQ0OH0.4qibyB3MaU_rP6BjER6heQJkgM318TGUXHFwMLr0kAU';

let supabase = null;
try {
    const g = window.supabase;
    if (g && typeof g.createClient === 'function') {
        supabase = g.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) {
    console.error('Supabase client init failed:', e);
}

export { supabase };

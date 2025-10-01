import type { AppProps } from 'next/app';
import { SupabaseProvider } from '@supabase/ssr';
import { supabase } from '@/lib/supabase';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SupabaseProvider supabaseClient={supabase}>
      <Component {...pageProps} />
    </SupabaseProvider>
  );
}
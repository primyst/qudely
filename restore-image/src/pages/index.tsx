'use client';

import { useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import UploadBox from '@/components/UploadBox';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';

type RestorationStatus = 'idle' | 'uploading' | 'restoring' | 'colorizing' | 'done' | 'error';

export default function HomePage() {
  const user = useUser();
  const supabase = useSupabaseClient();

  const [status, setStatus] = useState<RestorationStatus>('idle');
  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [restoredUrl, setRestoredUrl] = useState<string | null>(null);
  const [colorizedUrl, setColorizedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to restore images.</p>
      </div>
    );
  }

  const handleUpload = async (file: File) => {
    setStatus('uploading');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 1️⃣ Upload to Supabase storage via API
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      const { input_url } = await uploadRes.json();
      setInputUrl(input_url);
      setStatus('restoring');

      // 2️⃣ Call restore API
      const restoreRes = await fetch('/api/restore-and-colorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_url }),
      });

      if (!restoreRes.ok) throw new Error('Restore & colorize failed');

      const { restored_url, colorized_url } = await restoreRes.json();
      setRestoredUrl(restored_url);
      setColorizedUrl(colorized_url);
      setStatus('done');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(message);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Photo Restoration & Colorization</h1>

      <UploadBox onUpload={handleUpload} />

      {status !== 'idle' && <p className="my-2">Status: {status}</p>}
      {errorMessage && <p className="text-red-600">{errorMessage}</p>}

      {restoredUrl && colorizedUrl && (
        <BeforeAfterSlider before={restoredUrl} after={colorizedUrl} />
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [restoredUrl, setRestoredUrl] = useState<string | null>(null);
  const [colorizedUrl, setColorizedUrl] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setStatus('Uploading...');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      const { input_url } = await uploadResponse.json();

      setStatus('Restoring...');
      const restoreResponse = await fetch('/api/restore-and-colorize', {
        method: 'POST',
        body: JSON.stringify({ input_url }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!restoreResponse.ok) throw new Error('Restoration failed');

      const { restored_url, colorized_url } = await restoreResponse.json();
      setRestoredUrl(restored_url);
      setColorizedUrl(colorized_url);
      setStatus('Done');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setStatus(`Error: ${message}`);
    }
  };

  return (
    <div>
      <h1>Photo Restoration & Colorization</h1>
      <UploadBox onUpload={handleUpload} />
      {status && <p>Status: {status}</p>}
      {restoredUrl && colorizedUrl && (
        <BeforeAfterSlider before={restoredUrl} after={colorizedUrl} />
      )}
    </div>
  );
}
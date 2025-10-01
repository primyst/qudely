'use client';

import { useState } from 'react';
import UploadBox from './UploadBox';

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [restoredUrl, setRestoredUrl] = useState<string | null>(null);
  const [colorizedUrl, setColorizedUrl] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setStatus('Uploading...');
    setRestoredUrl(null);
    setColorizedUrl(null);

    try {
      // 1) Upload to Supabase Storage
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      const { input_url } = await uploadResponse.json();

      // 2) Restore & Colorize
      setStatus('Restoring & Colorizing...');
      const pipelineResponse = await fetch('/api/restore-and-colorize', {
        method: 'POST',
        body: JSON.stringify({ input_url }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!pipelineResponse.ok) throw new Error('Pipeline failed');

      const { restored_url, colorized_url } = await pipelineResponse.json();
      setRestoredUrl(restored_url);
      setColorizedUrl(colorized_url);
      setStatus('Done');
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <div>
      <h1>Photo Restoration & Colorization</h1>
      <UploadBox onUpload={handleUpload} />

      {status && <p>Status: {status}</p>}

      {restoredUrl && (
        <div>
          <h2>Restored Image</h2>
          <img src={restoredUrl} alt="Restored" />
        </div>
      )}

      {colorizedUrl && (
        <div>
          <h2>Colorized Image</h2>
          <img src={colorizedUrl} alt="Colorized" />
        </div>
      )}
    </div>
  );

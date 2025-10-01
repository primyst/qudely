'use client';

import { useState } from 'react';
import UploadBox from './UploadBox';
import BeforeAfterSlider from './BeforeAfterSlider';

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [restoredUrl, setRestoredUrl] = useState<string | null>(null);
  const [colorizedUrl, setColorizedUrl] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setStatus('Uploading...');
    setOriginalUrl(null);
    setRestoredUrl(null);
    setColorizedUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadResponse.ok) throw new Error('Upload failed');

      const { input_url } = await uploadResponse.json();
      setOriginalUrl(input_url);

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
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Photo Restoration & Colorization</h1>
      <UploadBox onUpload={handleUpload} />

      {status && <p>Status: {status}</p>}

      {originalUrl && restoredUrl && (
        <div>
          <h2>Original → Restored</h2>
          <BeforeAfterSlider before={originalUrl} after={restoredUrl} />
        </div>
      )}

      {restoredUrl && colorizedUrl && (
        <div>
          <h2>Restored → Colorized</h2>
          <BeforeAfterSlider before={restoredUrl} after={colorizedUrl} />
        </div>
      )}
    </div>
  );
        }

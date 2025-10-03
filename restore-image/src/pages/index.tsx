'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [restoredUrl, setRestoredUrl] = useState<string | null>(null);
  const [colorizedUrl, setColorizedUrl] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setStatus('Uploading...');
    try {
      // Preview on client
      const previewUrl = URL.createObjectURL(file);
      setUploadedUrl(previewUrl);

      // Send file to /api/upload (returns public input_url)
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload failed: ${uploadRes.status}`);
      }

      const { input_url } = await uploadRes.json();

      setStatus('Processing (restore + colorize)...');

      // Call pipeline API
      const pipelineRes = await fetch('/api/restore-and-colorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_url }),
      });

      if (!pipelineRes.ok) {
        throw new Error(`Pipeline failed: ${pipelineRes.status}`);
      }

      const data = await pipelineRes.json();
      setRestoredUrl(data.restored_url);
      setColorizedUrl(data.colorized_url);

      setStatus('Done');
    } catch (err: unknown) {
      setStatus(err instanceof Error ? `Error: ${err.message}` : 'Unknown error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Photo Restoration & Colorization</h1>

      <UploadBox onUpload={handleUpload} />

      {status && <p className="mb-4">Status: {status}</p>}

      {restoredUrl && colorizedUrl && (
        <BeforeAfterSlider before={restoredUrl} after={colorizedUrl} />
      )}
    </div>
  );
}
'use client';
import { useState } from 'react';
import UploadBox from '@/components/UploadBox';

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [restoredUrl, setRestoredUrl] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setStatus('Uploading...');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', { // make sure /api/upload exists
        method: 'POST',
        body: formData,
      });
      if (!uploadResponse.ok) throw new Error('Upload failed');

      const { input_url } = await uploadResponse.json();
      setStatus('Restoring...');

      const restoreResponse = await fetch('/api/restore', {
        method: 'POST',
        body: JSON.stringify({ input_url }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!restoreResponse.ok) throw new Error('Restoration failed');

      const { restored_url } = await restoreResponse.json();
      setRestoredUrl(restored_url);
      setStatus('Done');
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <div>
      <h1>Photo Restoration</h1>
      <UploadBox onUpload={handleUpload} />
      {status && <p>Status: {status}</p>}
      {restoredUrl && <img src={restoredUrl} alt="Restored" />}
    </div>
  );
  }

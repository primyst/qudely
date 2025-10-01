'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { replicateUtils } from '@/lib/replicate';
import { saveToStorage } from '@/lib/storage';

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [restoredUrl, setRestoredUrl] = useState<string | null>(null);
  const [colorizedUrl, setColorizedUrl] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setStatus('Uploading...');
    try {
      // Create object URL for preview
      const previewUrl = URL.createObjectURL(file);
      setUploadedUrl(previewUrl);

      setStatus('Restoring...');
      const restoredPublic = await replicateUtils.restoreImage(previewUrl);

      setRestoredUrl(restoredPublic);
      setStatus('Colorizing...');

      const colorPublic = await replicateUtils.colorizeImage(restoredPublic);
      setColorizedUrl(colorPublic);

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
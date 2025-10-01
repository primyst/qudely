'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface UploadBoxProps {
  onUpload: (file: File) => void;
}

export default function UploadBox({ onUpload }: UploadBoxProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onUpload(selectedFile);

      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  // Clean up the object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="my-4">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {file && <p>Selected file: {file.name}</p>}
      {previewUrl && (
        <div style={{ marginTop: '1rem', maxWidth: 400 }}>
          <Image
            src={previewUrl}
            alt="Preview"
            width={400}
            height={400}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      )}
    </div>
  );
}
"use client";

import React, { ChangeEvent, useState } from "react";

type RestoreResponse = {
  restored?: string; // data URI: data:image/png;base64,...
  error?: string;
};

export default function RestorePage(): React.ReactElement {
  const BACKEND_URL = "https://qudely.onrender.com/restore";
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [restored, setRestored] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [history, setHistory] = useState<
    { id: string; original: string; restored: string; createdAt: string }[]
  >([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setRestored(null);
    setMessage("");
  };

  const handleRestore = async (): Promise<void> => {
    if (!file) {
      setMessage("Please choose an image first.");
      return;
    }

    setLoading(true);
    setMessage("Uploading image... The server may download models on first run (this can take 20–60s).");
    setRestored(null);

    try {
      const form = new FormData();
      // backend expects key "file"
      form.append("file", file, file.name);

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        body: form, // DO NOT set Content-Type — browser sets the multipart boundary automatically
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      const data = (await res.json()) as RestoreResponse;

      if (data.error) {
        setMessage(`Restore failed: ${data.error}`);
        setLoading(false);
        return;
      }

      if (!data.restored) {
        setMessage("Unexpected response from server.");
        setLoading(false);
        return;
      }

      setRestored(data.restored);
      setMessage("Success!");

      // Add to local history (so you keep the small history UI without DB fetch)
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          original: preview ?? "",
          restored: data.restored!,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      if (err instanceof Error) {
        setMessage(`Error: ${err.message}`);
      } else {
        setMessage("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderImageBox = (src: string | null, label: string): JSX.Element | null => {
    if (!src) return null;
    return (
      <div className="w-full max-w-[420px]">
        <p className="text-sm text-gray-600 mb-2">{label}</p>
        <div className="w-full h-56 bg-gray-100 rounded overflow-hidden border">
          {/* use simple img tag to support data: URIs */}
          <img src={src} alt={label} className="w-full h-full object-contain" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-6 bg-slate-50">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Qudely — Restore & Colorize</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-gray-700">Upload an image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-3"
            />

            <div className="flex gap-3 items-center">
              <button
                onClick={handleRestore}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
              >
                {loading ? "Processing..." : "Restore Image"}
              </button>

              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setRestored(null);
                  setMessage("");
                }}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Reset
              </button>
            </div>

            <p className="mt-3 text-sm text-gray-600">{message}</p>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">History (local)</h3>
              {history.length === 0 ? (
                <p className="text-xs text-gray-500">No local history yet. Restored images will appear here.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((h) => (
                    <div key={h.id} className="flex gap-3 items-center">
                      <img src={h.original} alt="orig" className="w-16 h-16 object-cover rounded border" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-600">{new Date(h.createdAt).toLocaleString()}</div>
                        <a href={h.restored} target="_blank" rel="noreferrer" className="text-sm text-blue-600">
                          Open restored image
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6 items-center">
            {renderImageBox(preview, "Original preview")}
            {loading && (
              <div className="text-sm text-gray-500">Working… this may be slow on first run while the server downloads models.</div>
            )}
            {restored && renderImageBox(restored, "Restored result")}
          </div>
        </div>
      </div>
    </div>
  );
}
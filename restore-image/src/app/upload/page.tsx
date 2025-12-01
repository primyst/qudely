"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulate 3s loading so iframe has time to preload
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="w-full h-screen bg-white text-black flex flex-col">
      {/* NAV */}
      <nav className="w-full flex items-center justify-between px-8 py-5 border-b border-neutral-200">
        <div className="text-2xl font-bold tracking-tight">Qudely</div>
        <Link
          href="/"
          className="px-6 py-2 border border-black rounded-lg text-sm font-medium hover:bg-black hover:text-white transition"
        >
          Back to Home
        </Link>
      </nav>

      {/* IFRAME OR LOADING */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50">
            <Loader2 className="w-12 h-12 animate-spin text-black mb-4" />
            <p className="text-black text-lg">Loading Qudely Colorizer...</p>
          </div>
        ) : null}

        {/* Iframe fills full remaining viewport */}
        <iframe
          src="https://aryadytm-photo-colorization.hf.space?__theme=light"
          className="w-full h-full"
          style={{ border: "none" }}
          allow="camera; microphone; clipboard-read; clipboard-write;"
        />
      </div>
    </main>
  );
}

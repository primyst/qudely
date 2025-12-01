"use client";

import React, { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type SpaceMessage = {
  type: string;
  height?: number;
};

export default function UploadPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [iframeHeight, setIframeHeight] = useState(800); // default height
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const listener = (event: MessageEvent<unknown>) => {
      // Only accept messages from huggingface.co
      if (!event.origin.includes("huggingface.co")) return;

      // Check if event.data is an object with type property
      if (typeof event.data === "object" && event.data !== null) {
        const msg = event.data as SpaceMessage;
        if (msg.type === "spaceHeight" && typeof msg.height === "number") {
          setIframeHeight(msg.height);
        }
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  const handleWaitlist = () => {
    if (!email) return;
    alert(`Thanks! We'll notify ${email} when advanced AI is available.`);
    setEmail("");
  };

  return (
    <main className="w-full min-h-screen bg-white text-black flex flex-col">
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

      {/* IFRAME */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50">
            <Loader2 className="w-12 h-12 animate-spin text-black mb-4" />
            <p className="text-black text-lg">Loading Qudely Colorizer...</p>
          </div>
        )}

        <iframe
  src="https://aryadytm-photo-colorization.hf.space?__theme=light"
  style={{ border: "none", width: "100%", height: "2000px", overflow: "auto" }}
  allow="camera; microphone; clipboard-read; clipboard-write;"
/>
      </div>

      {/* WAITLIST SECTION */}
      <section className="w-full py-20 px-6 bg-neutral-50 text-center border-t border-neutral-200">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          Premium Advanced AI Coming Soon
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto mb-6">
          We’re building a more advanced AI image restoration tool with faster
          results and deeper enhancements. Join the waitlist to be notified
          first.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={handleWaitlist}
            className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:opacity-80 transition"
          >
            Join Waitlist
          </button>
        </div>
      </section>
    </main>
  );
      }

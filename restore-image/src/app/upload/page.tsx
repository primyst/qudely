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
  const [iframeHeight, setIframeHeight] = useState(1200); // default height
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Simulate loading for 3s
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Adjust iframe height dynamically if HF sends message
  useEffect(() => {
    const listener = (event: MessageEvent<unknown>) => {
      if (!event.origin.includes("huggingface.co")) return;
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
    <main className="w-full min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* NAV */}
      <nav className="w-full flex items-center justify-between px-8 py-5 bg-white shadow-sm">
        <div className="text-2xl font-bold tracking-tight">Qudely</div>
        <Link
          href="/"
          className="px-6 py-2 border border-gray-900 rounded-lg text-sm font-medium hover:bg-gray-900 hover:text-white transition-transform transform hover:scale-105"
        >
          Back to Home
        </Link>
      </nav>

      {/* IFRAME SECTION */}
      <section className="flex-1 relative w-full">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50">
            <Loader2 className="w-12 h-12 animate-spin text-gray-900 mb-4" />
            <p className="text-gray-900 text-lg">Loading Qudely...</p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src="https://aryadytm-photo-colorization.hf.space?__theme=light"
          style={{
            border: "none",
            width: "100%",
            height: `${iframeHeight}px`,
            minHeight: "1200px",
          }}
          className="shadow-lg rounded-b-xl"
          allow="camera; microphone; clipboard-read; clipboard-write;"
        />
      </section>

      {/* PREMIUM WAITLIST */}
      <section className="w-full py-20 px-6 text-center bg-gray-100 border-t border-gray-200">
        <h3 className="text-3xl md:text-4xl font-semibold mb-6">
          Premium Advanced AI Coming Soon
        </h3>
        <p className="text-gray-700 max-w-xl mx-auto mb-6">
          We’re building a faster and more advanced AI photo restoration tool. 
          Join the waitlist to get early access and updates.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button
            onClick={handleWaitlist}
            className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:opacity-90 shadow-md hover:shadow-lg transition-all"
          >
            Join Waitlist
          </button>
        </div>
      </section>
    </main>
  );
}
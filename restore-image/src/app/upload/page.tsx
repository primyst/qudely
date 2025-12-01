"use client";

import React, { useEffect, useState, useRef } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useForm, ValidationError } from "@formspree/react";

type SpaceMessage = {
  type: string;
  height?: number;
};

export default function UploadPage() {
  const [loading, setLoading] = useState(true);
  const [iframeHeight, setIframeHeight] = useState(1400);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [formState, submit] = useForm(process.env.NEXT_PUBLIC_NEW_FORM!);

  // Simulate initial load (remove in production if HF Space loads instantly)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  // Listen for height updates from Hugging Face Space
  useEffect(() => {
    const listener = (event: MessageEvent<unknown>) => {
      if (!event.origin.includes("huggingface.co")) return;
      if (typeof event.data === "object" && event.data !== null) {
        const msg = event.data as SpaceMessage;
        if (msg.type === "spaceHeight" && typeof msg.height === "number") {
          setIframeHeight(msg.height + 100); // small buffer
        }
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  return (
    <main className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* NAV - Matches homepage exactly */}
      <nav className="w-full flex items-center justify-between px-6 py-6 bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <Link href="/" className="text-3xl font-bold tracking-tighter text-gray-900">
          Qudely
        </Link>
        <Link
          href="/"
          className="group flex items-center gap-2 px-7 py-3 border border-gray-900 text-gray-900 rounded-full font-medium hover:bg-gray-900 hover:text-white transition-all hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          Back to Home
        </Link>
      </nav>

      {/* HERO HEADER */}
      <section className="py-16 px-6 text-center bg-gradient-to-b from-amber-50/50 to-white border-b border-gray-100">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
          Restore Your Photo
          <span className="block text-amber-600 mt-2">Instantly with AI</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
          Upload any old, faded, or black-and-white photo below — our AI will bring it back to life in seconds.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 text-sm text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          AI Engine Running • No signup required • Your photo is deleted after processing
        </div>
      </section>

      {/* IFRAME + LOADING OVERLAY */}
      <section className="relative flex-1 bg-gray-50">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-amber-600 mb-6" />
              <p className="text-2xl font-medium text-gray-800">Waking up the AI…</p>
              <p className="text-gray-600 mt-2">This takes just a moment</p>
            </div>
          </div>
        )}

        <div className="w-full">
          <iframe
            ref={iframeRef}
            src="https://aryadytm-photo-colorization.hf.space?__theme=light"
            className="w-full border-0 shadow-2xl"
            style={{
              height: `${iframeHeight}px`,
              minHeight: "1900px",
              transition: "height 0.4s ease",
            }}
            allow="camera; microphone; clipboard-read; clipboard-write;"
            loading="lazy"
            title="Qudely AI Photo Restoration"
          />
        </div>
      </section>

      {/* WAITLIST SECTION */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Next-Gen Restoration Coming Soon
          </h3>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Faster processing, face enhancement, scratch removal, and 4K upscaling — all in one click. Join the waitlist for early access.
          </p>

          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              className="flex-1 px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={formState.submitting}
              className="px-8 py-4 bg-amber-600 text-white font-semibold rounded-full hover:bg-amber-700 disabled:opacity-70 transition-all shadow-lg"
            >
              {formState.submitting ? "Joining…" : "Get Early Access"}
            </button>
          </form>

          <ValidationError prefix="Email" field="email" errors={formState.errors} />
          {formState.succeeded && (
            <p className="mt-6 text-amber-700 font-semibold text-lg">
              You’re in! We’ll email you when it’s ready
            </p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-gray-900 text-gray-300 text-center border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-2xl font-bold text-white mb-3">Qudely</p>
          <p className="text-sm mb-6">Preserving yesterday, for tomorrow.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <p>
              Built with love by{" "}
              <Link href="https://primyst.vercel.app" target="_blank" className="font-medium text-amber-400 hover:underline">
                Primyst
              </Link>
            </p>
            <span className="hidden sm:inline">•</span>
            <p>
              colorization powered by{" "}
              <Link href="#" target="_blank" className="font-medium text-amber-400 hover:underline">
                Aryadytm-photo-colorization
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
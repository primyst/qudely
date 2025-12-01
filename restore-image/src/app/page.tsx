"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, RefreshCcw, Image as ImageIcon, ArrowRight } from "lucide-react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { useForm, ValidationError } from "@formspree/react";

type ImageItem = { old: string; new: string; label: string };

const images: ImageItem[] = [
  { old: "/landmarkold.jpg", new: "/landmarknew.jpg", label: "Historic Landmark" },
  { old: "/girlold.jpg", new: "/girlnew.jpg", label: "Portrait Restoration" },
  { old: "/familyold.jpg", new: "/familynew.jpg", label: "Family Memory" },
];

export default function Home() {
  const [formState, submit] = useForm(process.env.NEXT_PUBLIC_NEW_FORM!);

  return (
    <main className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* NAV */}
      <nav className="w-full flex items-center justify-between px-6 py-6 bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="text-3xl font-bold tracking-tighter text-gray-900">
          Qudely
        </div>
        <Link
          href="/upload"
          className="group flex items-center gap-2 px-7 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all hover:scale-105 shadow-lg"
        >
          Try for Free
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-white to-white -z-10"></div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
          Bring Old Photos
          <span className="block text-amber-600 mt-3">Back to Life</span>
        </h1>
        <p className="mt-8 max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 leading-relaxed">
          Qudely uses advanced AI to restore faded, scratched, or black-and-white photos 
          with stunning clarity — instantly and for free.
        </p>

        <div className="mt-12">
          <Link
            href="/upload"
            className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all transform hover:scale-105 shadow-xl"
          >
            Restore Your First Photo Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-gray-600">No signup • Instant results • Privacy guaranteed</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-gray-50">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
          How It Works
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: ImageIcon, title: "Upload", desc: "Drop any old, damaged, or faded photo" },
            { icon: RefreshCcw, title: "AI Restores", desc: "Colors, sharpness, and details revived automatically" },
            { icon: ShieldCheck, title: "Download", desc: "Get your restored photo instantly — securely" },
          ].map((step, i) => (
            <div key={i} className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <step.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="py-24 px-6 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            See the Transformation
          </h2>
          <p className="mt-4 text-xl text-gray-600">Drag the slider to compare</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {images.map((img) => (
            <div key={img.label} className="group">
              <p className="text-center text-lg font-medium text-gray-700 mb-4">{img.label}</p>
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <ReactCompareSlider
                  itemOne={<ReactCompareSliderImage src={img.old} alt="Before" />}
                  itemTwo={<ReactCompareSliderImage src={img.new} alt="After" />}
                  style={{ height: "420px" }}
                  className="rounded-2xl"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WAITLIST */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Next-Gen Restoration Coming Soon
          </h3>
          <p className="text-xl text-gray-600 mb-10">
            Ultra-realistic colorization, face enhancement, and 4K upscaling. 
            Be the first to try it.
          </p>

          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              className="flex-1 px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition"
            />
            <button
              type="submit"
              disabled={formState.submitting}
              className="px-8 py-4 bg-amber-600 text-white font-semibold rounded-full hover:bg-amber-700 disabled:opacity-70 transition-all shadow-lg"
            >
              {formState.submitting ? "Joining..." : "Join Waitlist"}
            </button>
          </form>

          <ValidationError prefix="Email" field="email" errors={formState.errors} />
          {formState.succeeded && (
            <p className="mt-6 text-amber-700 font-semibold text-lg">
              Thank you! You're on the list
            </p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-gray-900 text-gray-300 text-center">
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
                Aryadytm-photo-restoratiom
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
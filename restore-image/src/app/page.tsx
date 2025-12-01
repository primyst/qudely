"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, RefreshCcw, Image as ImageIcon } from "lucide-react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { useForm, ValidationError } from "@formspree/react";

type ImageItem = { old: string; new: string; label: string; };

const images: ImageItem[] = [
  { old: "/landmarkold.jpg", new: "/landmarknew.jpg", label: "Historic Landmark" },
  { old: "/girlold.jpg", new: "/girlnew.jpg", label: "Portrait Restoration" },
  { old: "/familyold.jpg", new: "/familynew.jpg", label: "Family Memory" },
];

export default function Home() {
  const [formState, submit] = useForm(process.env.NEXT_PUBLIC_NEW_FORM!);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* NAV */}
      <nav className="w-full flex items-center justify-between px-8 py-5 bg-white shadow-sm">
        <div className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800">
          Qudely
        </div>
        <Link
          href="/upload"
          className="px-6 py-2 border border-gray-900 rounded-lg text-sm font-medium hover:bg-gray-900 hover:text-white transition-transform transform hover:scale-105"
        >
          Try for Free
        </Link>
      </nav>

      {/* HERO */}
      <section className="w-full py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-white -z-10"></div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
          Restore Old Photos with AI Precision
        </h1>
        <p className="max-w-2xl mx-auto text-gray-700 text-lg mb-10">
          Qudely revives damaged, faded, and black-and-white photos into clean, sharp, modern images — automatically.
        </p>
        <Link
          href="/upload"
          className="inline-block bg-gray-900 text-white font-medium px-8 py-3 rounded-xl hover:opacity-90 shadow-md hover:shadow-xl transition-all"
        >
          Get Started
        </Link>
      </section>

      {/* HOW IT WORKS */}
      <section className="w-full py-16 px-6 bg-white border-t border-b border-gray-200">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">How It Works</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <ImageIcon className="w-10 h-10 mb-4 text-gray-800" />
            <h3 className="text-lg font-medium mb-2">Upload</h3>
            <p className="text-gray-600 text-sm">Choose any old or faded photo from your device.</p>
          </div>
          <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <RefreshCcw className="w-10 h-10 mb-4 text-gray-800" />
            <h3 className="text-lg font-medium mb-2">Colorize</h3>
            <p className="text-gray-600 text-sm">Our AI restores colors and sharpness automatically.</p>
          </div>
          <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <ShieldCheck className="w-10 h-10 mb-4 text-gray-800" />
            <h3 className="text-lg font-medium mb-2">Download</h3>
            <p className="text-gray-600 text-sm">Save your restored photo instantly. Your data stays private.</p>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="w-full py-24 px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">Before & After</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          {images.map(img => (
            <div key={img.label} className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-3 px-4 pt-4">{img.label}</p>
              <ReactCompareSlider
                itemOne={<ReactCompareSliderImage src={img.old} alt="Before" />}
                itemTwo={<ReactCompareSliderImage src={img.new} alt="After" />}
                style={{ width: "100%", height: "350px" }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* WAITLIST */}
      <section className="w-full py-20 px-6 text-center bg-gray-100 border-t border-gray-200">
        <h3 className="text-3xl md:text-4xl font-semibold mb-6">Premium Advanced AI Coming Soon</h3>
        <p className="text-gray-700 max-w-xl mx-auto mb-6">
          We’re developing a more advanced AI image restoration tool. Join the waitlist to get early access and updates.
        </p>

        <form onSubmit={submit} className="flex flex-col md:flex-row justify-center gap-4 max-w-xl mx-auto">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button
            type="submit"
            disabled={formState.submitting}
            className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:opacity-90 shadow-md hover:shadow-lg transition-all"
          >
            {formState.submitting ? "Submitting..." : "Join Waitlist"}
          </button>
        </form>

        <ValidationError prefix="Email" field="email" errors={formState.errors} />
        {formState.succeeded && <p className="text-green-600 mt-4 font-medium">Thanks! You are on the waitlist.</p>}
      </section>

      {/* FOOTER */}
      <footer className="w-full py-6 bg-white border-t border-gray-200 text-center text-gray-600">
        Built by <Link href="https://primyst.vercel.app" target="_blank" className="font-medium hover:underline">Primyst</Link>
      </footer>
    </main>
  );
}
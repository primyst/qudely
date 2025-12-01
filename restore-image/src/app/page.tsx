"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  RefreshCcw,
  Image as ImageIcon
} from "lucide-react";

import {
  ReactCompareSlider,
  ReactCompareSliderImage
} from "react-compare-slider";

type ImageItem = {
  old: string;
  new: string;
  label: string;
};

const images: ImageItem[] = [
  { old: "/landmarkold.jpg", new: "/landmarknew.jpg", label: "Historic Landmark" },
  { old: "/girlold.jpg", new: "/girlnew.jpg", label: "Portrait Restoration" },
  { old: "/familyold.jpg", new: "/familynew.jpg", label: "Family Memory" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* NAV */}
      <nav className="w-full flex items-center justify-between px-8 py-5 border-b border-neutral-200">
        <div className="text-2xl font-bold tracking-tight">
          Qudely
        </div>
        <Link
          href="/upload"
          className="px-6 py-2 border border-black rounded-lg text-sm font-medium hover:bg-black hover:text-white transition"
        >
          Try for Free
        </Link>
      </nav>

      {/* HERO */}
      <section className="w-full py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-semibold mb-6 leading-tight">
          Restore Old Photos with AI Precision
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600 text-lg mb-10">
          Qudely revives damaged, faded, and black-and-white photos into
          clean, sharp, modern images — automatically.
        </p>

        <Link
          href="/upload"
          className="inline-block bg-black text-white font-medium px-8 py-3 rounded-xl hover:opacity-80 transition"
        >
          Get Started
        </Link>
      </section>

      {/* FEATURES */}
      <section className="w-full py-16 px-6 bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center">
            <ImageIcon className="w-10 h-10 mb-4" />
            <h3 className="text-lg font-medium mb-2">High-Quality Restoration</h3>
            <p className="text-gray-600 text-sm">
              Powered by advanced AI models that preserve fine details.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <RefreshCcw className="w-10 h-10 mb-4" />
            <h3 className="text-lg font-medium mb-2">Before / After Preview</h3>
            <p className="text-gray-600 text-sm">
              Compare transformations instantly with an interactive slider.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="w-10 h-10 mb-4" />
            <h3 className="text-lg font-medium mb-2">Privacy-Focused</h3>
            <p className="text-gray-600 text-sm">
              No storage — your images stay with you alone.
            </p>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER GALLERY */}
      <section className="w-full py-24 px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
          Before & After
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          {images.map((img) => (
            <div key={img.label}>
              <p className="text-sm text-gray-500 mb-3">{img.label}</p>
              <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                <ReactCompareSlider
                  itemOne={<ReactCompareSliderImage src={img.old} alt="Before" />}
                  itemTwo={<ReactCompareSliderImage src={img.new} alt="After" />}
                  style={{ width: "100%", height: "350px" }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-20 px-6 text-center bg-neutral-100 border-t border-neutral-200">
        <h3 className="text-3xl font-semibold mb-6">
          Ready to Restore Your Photos?
        </h3>
        <p className="text-gray-600 max-w-xl mx-auto mb-10">
          Upload an old image and let Qudely transform it with modern AI restoration.
        </p>

        <Link
          href="/upload"
          className="inline-block bg-black text-white font-medium px-8 py-3 rounded-xl hover:opacity-80 transition"
        >
          Start Now
        </Link>
      </section>
    </main>
  );
}

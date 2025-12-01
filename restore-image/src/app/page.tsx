"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Image as ImageIcon, RefreshCcw } from "lucide-react";
import ReactCompareImage from "react-compare-image";

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
      {/* HERO */}
      <section className="w-full py-24 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-semibold mb-6">
          Restore Your Old Photos with AI
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600 text-lg mb-10">
          Qudely enhances old and damaged photographs with cutting-edge
          restoration technology — clean, detailed, and natural.
        </p>

        <Link
          href="/upload"
          className="inline-block bg-black text-white font-medium px-8 py-3 rounded-xl hover:opacity-80 transition"
        >
          Try for Free
        </Link>
      </section>

      {/* FEATURES */}
      <section className="w-full py-16 px-6 border-t border-gray-200 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center">
            <ImageIcon className="w-10 h-10 mb-4 text-black" />
            <h3 className="text-lg font-medium mb-2">High-Quality Restoration</h3>
            <p className="text-gray-600 text-sm">
              AI enhancement that maintains realistic textures and detail.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <RefreshCcw className="w-10 h-10 mb-4 text-black" />
            <h3 className="text-lg font-medium mb-2">Before / After Comparison</h3>
            <p className="text-gray-600 text-sm">
              Instantly view transformation with an interactive slider.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="w-10 h-10 mb-4 text-black" />
            <h3 className="text-lg font-medium mb-2">Privacy First</h3>
            <p className="text-gray-600 text-sm">
              No storage. No tracking. Your photos stay yours alone.
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
              <p className="text-sm text-gray-600 mb-3">{img.label}</p>
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <ReactCompareImage
                  leftImage={img.old}
                  rightImage={img.new}
                  sliderLineColor="#000000"
                  handleSize={30}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-20 px-6 text-center border-t border-gray-200 bg-gray-50">
        <h3 className="text-3xl font-semibold mb-6">
          Restore Your Photos Now
        </h3>
        <p className="text-gray-600 max-w-xl mx-auto mb-10">
          Upload an old photograph and watch Qudely restore it with
          high-accuracy detail and clarity.
        </p>

        <Link
          href="/upload"
          className="inline-block bg-black text-white font-medium px-8 py-3 rounded-xl hover:opacity-80 transition"
        >
          Get Started
        </Link>
      </section>
    </main>
  );
}

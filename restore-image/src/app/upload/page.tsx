"use client";

import React from "react";

const QudelyColorizer = () => {
  return (
    <section className="w-full flex justify-center py-10 px-4 bg-[#0a0a0a]">
      <div className="w-full max-w-3xl bg-[#111] rounded-2xl shadow-xl border border-[#222] p-6">

        {/* Title */}
        <h1 className="text-2xl font-semibold text-white mb-2">
          Qudely
        </h1>

        {/* Subtext */}
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Bring your old black-and-white memories back to life. Powered by AI.
        </p>

        {/* Iframe Container */}
        <div className="rounded-xl overflow-hidden border border-[#222] shadow-lg">
          <iframe
            src="https://aryadytm-photo-colorization.hf.space?__theme=dark"
            className="w-full h-[680px]"
            style={{
              border: "none",
              borderRadius: "12px",
              background: "#000",
            }}
            allow="camera; microphone; clipboard-read; clipboard-write;"
          ></iframe>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-500 mt-4">
          Processing runs securely on HuggingFace Spaces. Qudely never stores your images.
        </p>
      </div>
    </section>
  );
};

export default QudelyColorizer;

"use client";

import React, { useState } from "react";
import UploadForm from "../components/UploadForm";
import { RestorationInsert } from "../types";

export default function Dashboard() {
  const [restorations, setRestorations] = useState<RestorationInsert[]>([]);

  // callback to handle new uploads
  const handleUpload = (restoration: RestorationInsert) => {
    setRestorations((prev) => [...prev, restoration]);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      {/* Upload Form with onUpload */}
      <UploadForm onUpload={handleUpload} />

      {/* Show restorations */}
      <ul className="mt-6 space-y-2">
        {restorations.map((r, i) => (
          <li
            key={i}
            className="border rounded p-2 bg-gray-50 flex flex-col gap-1"
          >
            <span>
              <strong>Original:</strong> {r.original_url}
            </span>
            {r.restored_url && (
              <span>
                <strong>Restored:</strong> {r.restored_url}
              </span>
            )}
            {r.colorized_url && (
              <span>
                <strong>Colorized:</strong> {r.colorized_url}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
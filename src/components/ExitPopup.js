// ExitPopup.js
"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function ExitPopup({ open, onClose }) {
  const router = useRouter();

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex min-h-[260px] w-full max-w-xs flex-col justify-center rounded-xl border border-black/80 dark:border-white/80 bg-white dark:bg-black p-4 shadow-2xl sm:min-h-[380px] sm:max-w-md sm:p-8">
        <h1 className="mb-4 text-center text-lg font-extrabold text-black dark:text-white sm:mb-8 sm:text-2xl">
          You Love Taxes? Go Ahead and Close This Tab
        </h1>
        <h2 className="mb-3 text-center text-base font-semibold text-black dark:text-white sm:mb-6 sm:text-xl">
          Be the first to know when new Opportunity Zone deals drop
        </h2>
        <p className="mb-6 text-center text-sm text-black dark:text-white sm:mb-8 sm:text-base">
          Join Our Exclusive Investor List!
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700 sm:px-6 sm:py-2"
            onClick={() => router.push("/auth/login")}
          >
            Join Our VIP List
          </button>
          <button
            className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-100 sm:px-6 sm:py-2"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

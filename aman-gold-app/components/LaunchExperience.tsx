"use client";

import { useEffect, useState } from "react";
import PhoneShell from "./PhoneShell";

export default function LaunchExperience() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShowSplash(false));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <PhoneShell />
      {showSplash && (
        <div
          role="status"
          aria-label="AMAN GOLD loading"
          aria-live="polite"
          className="fixed inset-0 z-[100] grid place-items-center bg-aman-gradient text-white"
        >
          <div className="text-center">
            <div className="text-3xl font-extrabold tracking-[0.2em]">AMAN</div>
            <div className="mt-1 text-sm font-semibold tracking-[0.45em] text-white/90">GOLD</div>
            <div aria-hidden="true" className="mx-auto mt-5 h-1 w-12 rounded-full bg-gold" />
          </div>
        </div>
      )}
    </>
  );
}

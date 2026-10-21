"use client";
import { useState } from "react";
import { useApp } from "../AppProvider";

/** First-visit popover anchored under the header: GPS or pick manually. */
export function LocationPrompt() {
  const { loc, openLocation } = useApp();
  const [dismissed, setDismissed] = useState(false);
  if (loc || dismissed) return null;
  return (
    <div className="fixed inset-0 z-[45] animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="loc-prompt-title">
      <button aria-label="Close" tabIndex={-1} className="absolute inset-0 bg-black/50" onClick={() => setDismissed(true)} />
      <div className="absolute left-4 right-4 top-[96px] mx-auto max-w-[440px] md:left-[300px] md:right-auto md:top-[78px] md:w-[440px]">
        <span aria-hidden className="absolute -top-2 left-12 size-4 rotate-45 bg-bg" />
        <div className="relative rounded-xl bg-bg p-5 text-center">
          <h2 id="loc-prompt-title" className="text-base font-bold text-text">Select your location</h2>
          <p className="mx-auto mt-2 max-w-[300px] text-sm leading-5 text-muted">We need your location to show you products from the store closest to you</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button autoFocus onClick={() => { setDismissed(true); openLocation({ gps: true }); }} className="h-11 rounded-md bg-accent text-sm font-semibold text-on-accent hover:bg-accent-hover">Use my location</button>
            <button onClick={() => { setDismissed(true); openLocation(); }} className="h-11 rounded-md border border-accent bg-bg text-sm font-semibold text-accent">Select manually</button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { useApp } from "../AppProvider";
import { Button } from "../ui/Button";

/** First-visit prompt: we need a location to pick the nearest store. */
export function LocationPrompt() {
  const { loc, openLocation } = useApp();
  const [dismissed, setDismissed] = useState(false);
  if (loc || dismissed) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-scrim/40 px-3 pt-24 animate-fade-in md:pt-28" role="dialog" aria-modal="true" aria-labelledby="loc-prompt-title">
      <div className="w-full max-w-md rounded-lg bg-bg p-5 shadow-pop">
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-accent-soft text-accent"><MapPin /></div>
        <h2 id="loc-prompt-title" className="text-center text-lg font-extrabold">Where should we deliver?</h2>
        <p className="mt-1 text-center text-sm text-muted">Prices, stock and delivery time depend on the store nearest to you.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button onClick={() => { setDismissed(true); openLocation(); }} autoFocus>Set location</Button>
          <Button variant="secondary" onClick={() => setDismissed(true)}>Just browsing</Button>
        </div>
      </div>
    </div>
  );
}

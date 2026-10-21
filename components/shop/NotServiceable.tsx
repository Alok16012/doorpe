"use client";
import { MapPinOff } from "lucide-react";
import { useApp } from "../AppProvider";
import { Button } from "../ui/Button";

export function NotServiceable({ cities }: { cities: string[] }) {
  const { loc, svc, openLocation } = useApp();
  if (!loc || !svc || (svc.ok && svc.open)) return null;
  const closed = svc.ok && !svc.open;
  return (
    <div className="mx-3 mt-3 flex items-start gap-3 rounded-md border border-warning/30 bg-warning/5 p-4 md:mx-0">
      <MapPinOff className="mt-0.5 shrink-0 text-warning" aria-hidden />
      <div className="flex-1">
        <p className="font-extrabold">{closed ? "The store near you is closed right now" : `We don't deliver to ${loc.label} yet`}</p>
        <p className="mt-0.5 text-sm text-muted">
          {closed ? "You can still browse and fill your cart. Ordering opens at 6 AM." : `You can still browse. We're live in ${cities.join(", ")}.`}
        </p>
      </div>
      {!closed && <Button size="sm" variant="secondary" onClick={() => openLocation()}>Change</Button>}
    </div>
  );
}

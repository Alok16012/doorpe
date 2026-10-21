"use client";
import { useEffect, useRef, useState } from "react";

/** While `on`, watch GPS and send it to the server at most every 5 s. */
export function useRiderLocation(on: boolean) {
  const [state, setState] = useState<"off" | "waiting" | "live" | "denied" | "unsupported">("off");
  const last = useRef(0);
  useEffect(() => {
    if (!on) { setState("off"); return; }
    if (!("geolocation" in navigator)) { setState("unsupported"); return; }
    setState("waiting");
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setState("live");
        const now = Date.now();
        if (now - last.current < 5000) return;
        last.current = now;
        fetch("/api/rider/location", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }) }).catch(() => {});
      },
      () => setState("denied"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [on]);
  return state;
}

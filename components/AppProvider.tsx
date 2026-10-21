"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { User } from "@/lib/types";
import { LocationSheet } from "./shop/LocationSheet";
import { LoginSheet } from "./account/LoginSheet";

export type ClientLoc = { lat: number; lng: number; label: string; sub: string } | null;
export type ClientSvc = { ok: boolean; etaMin: number | null; storeName: string | null; open: boolean; city?: string };

type Ctx = {
  user: User | null;
  setUser: (u: User | null) => void;
  loc: ClientLoc;
  svc: ClientSvc | null;
  openLocation: () => void;
  openLogin: (then?: () => void) => void;
  toast: (msg: string) => void;
};
const C = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(C);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
};

export function AppProvider({ children, initialUser, loc, svc }: { children: React.ReactNode; initialUser: User | null; loc: ClientLoc; svc: ClientSvc | null }) {
  const [user, setUser] = useState(initialUser);
  const [locOpen, setLocOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const after = useRef<(() => void) | undefined>(undefined);
  const [toastMsg, setToastMsg] = useState<{ id: number; text: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toast = useCallback((text: string) => {
    clearTimeout(timer.current);
    setToastMsg({ id: Date.now(), text });
    timer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);
  const openLogin = useCallback((then?: () => void) => { after.current = then; setLoginOpen(true); }, []);
  const openLocation = useCallback(() => setLocOpen(true), []);
  const closeLoc = useCallback(() => setLocOpen(false), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  return (
    <C.Provider value={{ user, setUser, loc, svc, openLocation, openLogin, toast }}>
      {children}
      <LocationSheet open={locOpen} onClose={closeLoc} hasLocation={!!loc} />
      <LoginSheet
        open={loginOpen}
        onClose={closeLogin}
        onDone={(u) => { setUser(u); setLoginOpen(false); const f = after.current; after.current = undefined; f?.(); }}
      />
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-0 z-[60]">
        {toastMsg && (
          <div key={toastMsg.id} className="absolute bottom-24 left-1/2 max-w-[90vw] -translate-x-1/2 animate-toast rounded-md bg-text px-4 py-2.5 text-sm font-semibold text-bg shadow-pop md:bottom-8">
            {toastMsg.text}
          </div>
        )}
      </div>
    </C.Provider>
  );
}

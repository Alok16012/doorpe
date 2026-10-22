"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function TitleBar({ title, right, back, center = false, tabRoot = false }: { title: string; right?: React.ReactNode; back?: string; center?: boolean; tabRoot?: boolean }) {
  const router = useRouter();
  return (
    <header style={{ paddingTop: "env(safe-area-inset-top)" }} className="sticky top-0 z-30 border-b border-border bg-bg">
      <div className="relative mx-auto flex h-14 max-w-3xl items-center gap-2 px-2">
        <button onClick={() => (back ? router.push(back) : history.length > 1 ? router.back() : router.push("/"))} aria-label="Go back" className={`${tabRoot ? "hidden md:grid" : "grid"} size-10 place-items-center rounded-full hover:bg-surface`}><ArrowLeft size={22} /></button>
        <h1 className={`flex-1 truncate font-bold text-text ${tabRoot ? "pl-2 text-lg md:pl-0 md:text-base" : "text-base"} ${center ? "pointer-events-none absolute inset-x-16 text-center" : ""}`}>{title}</h1>
        {center && <span className="flex-1" />}
        {right}
      </div>
    </header>
  );
}

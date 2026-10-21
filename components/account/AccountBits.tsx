"use client";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { useApp } from "../AppProvider";
import { Button } from "../ui/Button";

export function LoginPrompt({ title = "Log in to see your account", body = "Orders, addresses and refunds all live here." }: { title?: string; body?: string }) {
  const { openLogin } = useApp();
  const router = useRouter();
  return (
    <div className="mx-auto max-w-md p-6 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-accent-soft text-accent"><UserRound size={28} /></span>
      <p className="mt-4 text-lg font-extrabold">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
      <Button className="mt-5" onClick={() => openLogin(() => router.refresh())}>Log in with phone</Button>
    </div>
  );
}

export function LogoutButton() {
  const { setUser } = useApp();
  const router = useRouter();
  return (
    <button
      onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); router.push("/"); router.refresh(); }}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-bg py-3.5 text-sm font-bold text-danger hover:bg-danger/5"
    >
      <LogOut size={16} /> Log out
    </button>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="text-6xl" aria-hidden>🛒</p>
        <h1 className="mt-4 text-xl font-extrabold">This aisle doesn&apos;t exist</h1>
        <p className="mt-1 text-sm text-muted">The page you&apos;re after has moved or never existed.</p>
        <Link href="/" className="mt-5 inline-flex h-10 items-center rounded-md bg-accent px-5 text-sm font-bold text-on-accent">Back to the store</Link>
      </div>
    </div>
  );
}

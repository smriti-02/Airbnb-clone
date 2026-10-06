import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-[150px] font-bold text-neutral-200 leading-none">404</h1>
      <h2 className="text-3xl font-bold mt-4 mb-4">We can't seem to find the page you're looking for.</h2>
      <p className="text-neutral-500 mb-8 max-w-md">The page may have been moved, deleted, or possibly never existed.</p>
      <Link href="/" className="px-6 py-3 bg-[color:var(--color-airbnb-primary)] text-white rounded-xl font-bold hover:bg-[color:var(--color-airbnb-primary-hover)] transition">
        Head back home
      </Link>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-extrabold text-violet-400">404</h1>
        <p className="text-gray-400">Page not found.</p>
        <Link href="/" className="inline-block mt-4 bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg text-sm transition-colors">
          Back to Home
        </Link>
      </div>
    </main>
  );
}

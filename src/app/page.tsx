import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Welcome to Our App</h1>
        <Link
          href="/login"
          className="bg-avocado-500 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </main>
  );
}

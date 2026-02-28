import Link from "next/link";

export default function POSPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold text-gray-900">POS</h1>
      <p className="mt-2 text-gray-500">Point of sale demo — placeholder.</p>
      <Link href="/" className="mt-4 inline-block text-accent hover:underline">
        Back to demos
      </Link>
    </main>
  );
}

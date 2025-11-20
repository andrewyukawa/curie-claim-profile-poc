import Link from "next/link";

export default function ClaimPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Curie
        </h1>
        <p className="text-gray-600 mb-8">
          Claim your Curie profile to unlock personalized features and connect
          with your professional network.
        </p>
        <Link
          href="/lookup"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Claim your Curie profile
        </Link>
      </div>
    </div>
  );
}


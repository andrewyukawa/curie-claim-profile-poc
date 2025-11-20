"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LookupPage() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<"name" | "npi">("name");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Name search fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [state, setState] = useState("");

  // NPI search field
  const [npi, setNpi] = useState("");

  // US states for dropdown
  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let url = "/api/npi-lookup?";
      
      if (searchType === "name") {
        if (!firstName || !lastName) {
          setError("Please enter both first and last name");
          setLoading(false);
          return;
        }
        url += `first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}`;
        if (state) {
          url += `&state=${encodeURIComponent(state)}`;
        }
      } else {
        if (!npi || npi.length !== 10) {
          setError("Please enter a valid 10-digit NPI number");
          setLoading(false);
          return;
        }
        url += `npi=${encodeURIComponent(npi)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search NPI registry");
      }

      // Store results in sessionStorage and navigate to select page
      sessionStorage.setItem("npiResults", JSON.stringify(data.results));
      router.push("/select");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Find Your Profile
        </h1>

        {/* Search type toggle */}
        <div className="mb-6 flex gap-4">
          <button
            type="button"
            onClick={() => setSearchType("name")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium ${
              searchType === "name"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Search by Name
          </button>
          <button
            type="button"
            onClick={() => setSearchType("npi")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium ${
              searchType === "npi"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Search by NPI
          </button>
        </div>

        <form onSubmit={handleSearch}>
          {searchType === "name" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State (Optional)
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a state</option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NPI Number (10 digits) *
              </label>
              <input
                type="text"
                value={npi}
                onChange={(e) => setNpi(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1234567890"
                required
              />
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>
    </div>
  );
}


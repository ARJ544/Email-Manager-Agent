"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [tokens, setTokens] = useState<{
    access_token: string | null;
    refresh_token: string | null;
  }>({
    access_token: null,
    refresh_token: null,
  });

  const [loading, setLoading] = useState(true);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google/login";
  };

  const loadTokens = async () => {
    try {
      const res = await fetch("http://localhost:8000/auth/tokens", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      setTokens(data);

      if (data.refresh_token && !data.access_token) {
        await fetch("http://localhost:8000/auth/refreshaccesstoken", {
          method: "GET",
          credentials: "include",
        });

        const res2 = await fetch("http://localhost:8000/auth/tokens", {
          method: "GET",
          credentials: "include",
        });

        const updated = await res2.json();
        setTokens(updated);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">

      <div className="flex flex-col items-center justify-start py-16 px-4">

        {!loading && !tokens.refresh_token && (
          <div className="mt-8 w-full max-w-xl p-6 border rounded-lg bg-gray-100 dark:bg-gray-800">

            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Authenticate Yourself First
            </h2>

            <button
              onClick={handleGoogleLogin}
              className="px-4 py-2 h-10 font-medium rounded-xl text-white bg-black hover:bg-neutral-900 dark:text-black dark:bg-white dark:hover:bg-neutral-200 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Authenticate
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

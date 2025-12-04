"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [tokens, setTokens] = useState<{ access_token: string | null; refresh_token: string | null }>({
    access_token: null,
    refresh_token: null,
  });

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google/login";
  };

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch("http://localhost:8000/auth/tokens", {
          method: "GET",
          credentials: "include", // include cookies
        });
        const data = await res.json();
        setTokens(data);
      } catch (err) {
        console.error("Error fetching tokens:", err);
      }
    };

    fetchTokens();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-16 px-4 bg-gray-50 dark:bg-gray-900 transition-colors">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Gmail OAuth Test (Next.js + FastAPI)
      </h1>

      <button
        onClick={handleGoogleLogin}
        className="px-6 py-3 text-white text-lg font-medium rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
      >
        Login with Google
      </button>

      {tokens.access_token && (
        <div className="mt-8 w-full max-w-xl p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Tokens from Cookie</h2>
          <pre className="bg-gray-200 dark:bg-gray-700 p-4 rounded-md overflow-x-auto text-sm text-gray-800 dark:text-gray-200">
            {JSON.stringify(tokens, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

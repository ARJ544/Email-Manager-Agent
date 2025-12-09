"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ChatUI from "@/components/my_ui/ChatUi";

export default function HomePage() {
  const [tokens, setTokens] = useState<{
    access_token: string | null;
    refresh_token: string | null;
  }>({
    access_token: null,
    refresh_token: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    console.error("NEXT_PUBLIC_BACKEND_URL is missing.");
    return;
  }
  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/auth/google/login`;
  };

  const loadTokens = async () => {
    try {
      const res = await fetch(`${backendUrl}/auth/tokens`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      setTokens(data);

      if (data.refresh_token && !data.access_token) {
        await fetch(`${backendUrl}/auth/refreshaccesstoken`, {
          method: "GET",
          credentials: "include",
        });

        window.location.reload();
      }
    } catch (err) {
      setError(String(err))
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

      {/* Loading State */}
      {loading && (
        <div className="mt-8 w-full max-w-xl p-6 border rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 shadow-sm text-center">
          <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Please wait… Do Not REFRESH
          </h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Backend is waking up. This may take a moment.
          </p>
        </div>
      )}

      {/* Chat UI if authenticated */}
      {tokens.refresh_token && tokens.access_token && !loading && (
        <ChatUI access_token={tokens.access_token} />
      )}

      {/* Auth Box */}
      {!loading && !tokens.refresh_token && (
        <div className="mt-8 w-full max-w-xl p-6 border rounded-lg bg-gray-100 dark:bg-gray-800">

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Authenticate Yourself First
          </h2>

          <Button
            onClick={handleGoogleLogin}
            className="px-4 py-2 h-10 font-medium rounded-xl text-white bg-black hover:bg-neutral-900 dark:text-black dark:bg-white dark:hover:bg-neutral-200 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Authenticate
          </Button>

          {error && (
            <div className="mt-4 p-5 rounded-xl border border-red-300 bg-linear-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/10 dark:border-red-700 shadow-sm">

              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                  Error Detected
                </h3>
              </div>

              <div className="mb-4 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700">
                <p className="text-sm text-red-700 dark:text-red-200 leading-relaxed">
                  {error}
                </p>
              </div>

              <div className="h-px bg-red-300 dark:bg-red-700/50 mb-3" />

              <h4 className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                Possible Causes
              </h4>
              <ul className="list-disc ml-5 text-sm text-red-700 dark:text-red-200 space-y-1">
                <li>Backend server may be offline.</li>
                <li>The API route URL might be incorrect.</li>
                <li>Google OAuth credentials may not be configured properly.</li>
                <li>Network issues or blocked requests.</li>
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  </div>
);

}

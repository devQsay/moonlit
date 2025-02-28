"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/images/moonlit-logo.svg"
                alt="Moonlit Logo"
                width={100}
                height={32}
                priority
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 dark:text-gray-300">
              Welcome, {session?.user?.email}
            </span>
            <Link
              href="/api/auth/signout"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-lg">
              <h2 className="text-lg font-medium text-indigo-800 dark:text-indigo-200 mb-2">
                Your Galleries
              </h2>
              <p className="text-indigo-600 dark:text-indigo-300 mb-4">
                Manage your photo galleries
              </p>
              <Link
                href="/galleries"
                className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                View galleries
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Link>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg">
              <h2 className="text-lg font-medium text-purple-800 dark:text-purple-200 mb-2">
                Upload Photos
              </h2>
              <p className="text-purple-600 dark:text-purple-300 mb-4">
                Add new photos to your galleries
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
              >
                Upload now
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Link>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg">
              <h2 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                Client Access
              </h2>
              <p className="text-green-600 dark:text-green-300 mb-4">
                Manage client permissions and access
              </p>
              <Link
                href="/clients"
                className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
              >
                Manage clients
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

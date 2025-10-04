"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      <div className="bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-800 flex justify-center items-center gap-2">
            <LogIn className="w-6 h-6 text-blue-600" /> Welcome Back
          </h2>
          <p className="text-gray-500 text-sm">
            Sign in to continue your AI-powered experience ✨
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="flex items-center border rounded-lg px-3 mt-1">
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full py-2 outline-none bg-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="flex items-center border rounded-lg px-3 mt-1">
              <Lock className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full py-2 outline-none bg-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2.5 rounded-lg shadow disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-sm text-center space-y-2">
          <Link
            href="/auth/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
          <p className="text-gray-500">
            New here?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-600 font-medium hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
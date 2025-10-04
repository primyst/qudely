"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock } from "lucide-react";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create a profile for the new user
      await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
      });

      setMessage("Account created successfully! Please check your email to confirm.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-100 p-4">
      <div className="bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-800 flex justify-center items-center gap-2">
            <UserPlus className="w-6 h-6 text-emerald-600" /> Create Account
          </h2>
          <p className="text-gray-500 text-sm">
            Join our AI platform and get started in seconds 🚀
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
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
            <label className="text-sm font-medium text-gray-700">Password</label>
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

          {message && (
            <p className="text-emerald-600 text-sm bg-emerald-50 p-2 rounded">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 transition text-white font-semibold py-2.5 rounded-lg shadow disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="text-sm text-center space-y-2">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-emerald-600 font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
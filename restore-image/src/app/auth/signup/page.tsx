"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // typed client
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock } from "lucide-react";

export default function SignupPage() {
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

    // 🔹 Sign up user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user || !user.id) {
      setError("Signup failed, no user returned.");
      setLoading(false);
      return;
    }

    // 🔹 Insert profile using typed client
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email!,
        trial_count: 0,
        is_premium: false,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Profile insert failed:", insertError);
      setError("An error occurred while setting up your profile.");
    } else {
      setMessage(
        "Account created successfully! Please check your email to confirm your Qudely account."
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-100 p-4">
      <div className="bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl p-8 w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">
            Qudely
          </h1>
          <p className="text-gray-500 text-sm tracking-wide">
            AI Image Restoration & Colorization Suite 🎨
          </p>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800 flex justify-center items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" /> Create Your Account
          </h2>
          <p className="text-gray-500 text-sm">
            Join Qudely and start transforming images with AI magic ✨
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 mt-1 focus-within:ring-2 focus-within:ring-blue-500">
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
            <div className="flex items-center border border-gray-300 rounded-lg px-3 mt-1 focus-within:ring-2 focus-within:ring-blue-500">
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
            <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>
          )}

          {message && (
            <p className="text-blue-600 text-sm bg-blue-50 p-2 rounded">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition text-white font-semibold py-2.5 rounded-lg shadow disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="text-sm text-center space-y-2">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 pt-2">
          © {new Date().getFullYear()} Qudely — Empowering AI creativity
        </p>
      </div>
    </div>
  );
}
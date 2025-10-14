"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    // Create profile
    if (data.user) {
  await supabase.from("profiles").insert({
    id: data.user.id,
    email: data.user.email,
    trial_count: 2, // give 2 free trials
    is_premium: false,
  });
}

    toast.success("Account created! Redirecting, check your email to confirm your account...");
    router.push("/dashboard");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-green-100 to-green-200">
      <Toaster position="top-right" />
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-2xl shadow-xl w-96 space-y-6"
      >
        <h1 className="text-4xl font-extrabold text-center text-green-700">Qudely</h1>
        <h2 className="text-2xl font-bold text-gray-800 text-center">Create Account</h2>
        <p className="text-center text-gray-500">Start your free trial today</p>

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-lg font-semibold"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-sm text-center text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-green-600 hover:underline font-medium">Login</a>
        </p>
      </form>
    </div>
  );
}
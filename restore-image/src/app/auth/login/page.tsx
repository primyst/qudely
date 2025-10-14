"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200">
      <Toaster position="top-right" />
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl w-96 space-y-6"
      >
        <h1 className="text-4xl font-extrabold text-center text-blue-700">Qudely</h1>
        <h2 className="text-2xl font-bold text-gray-800 text-center">Welcome Back</h2>
        <p className="text-center text-gray-500">Enter your credentials to access your account</p>

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center text-gray-500">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline font-medium">Sign Up</a>
        </p>
      </form>
    </div>
  );
}
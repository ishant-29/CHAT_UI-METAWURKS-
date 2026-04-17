"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiGoogle, SiGithub } from "react-icons/si";
import MouseGlow from "@/components/ui/MouseGlow";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Auto sign in after successful signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but login failed. Please try logging in.");
      } else {
        router.push("/chat");
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn(provider, { 
        callbackUrl: "/chat",
        redirect: false 
      });
      
      if (result?.error) {
        setError(`${provider} sign-in failed. Please try email/password instead.`);
        setLoading(false);
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      setError(`${provider} sign-in failed. Please try email/password instead.`);
      setLoading(false);
    }
  };

  return (
    <div data-auth-page className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eef2f9] to-[#e0e7f1] relative overflow-hidden cursor-none [&_*]:cursor-none">
      <MouseGlow />
      {/* Background decorations */}
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[450px] rounded-full bg-blue-300/40 blur-[100px] pointer-events-none" />
      <div className="absolute top-[10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-purple-300/30 blur-[90px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#e2e8f0]">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/metawurks-logo.svg" alt="MetaWurks" className="h-10 w-auto" />
          </div>

          <h1 className="text-2xl font-bold text-center text-[#0f172a] mb-2">
            Create Account
          </h1>
          <p className="text-center text-[#64748b] mb-6">
            Sign up to get started with MetaWurks
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#d4dbe8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-[#0f172a]"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#d4dbe8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-[#0f172a]"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#d4dbe8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-[#0f172a]"
                placeholder="••••••••"
                minLength={6}
                required
              />
              <p className="mt-1 text-xs text-[#64748b]">
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white py-2.5 rounded-lg font-medium hover:from-[#2563eb] hover:to-[#3b82f6] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2e8f0]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#64748b]">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {process.env.NEXT_PUBLIC_GOOGLE_ENABLED !== "false" && (
              <button
                onClick={() => handleOAuthSignIn("google")}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#d4dbe8] rounded-lg hover:bg-[#f8fafc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SiGoogle className="text-[#4285f4]" size={18} />
                <span className="text-sm font-medium text-[#475569]">Google</span>
              </button>
            )}

            {process.env.NEXT_PUBLIC_GITHUB_ENABLED !== "false" && (
              <button
                onClick={() => handleOAuthSignIn("github")}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#d4dbe8] rounded-lg hover:bg-[#f8fafc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SiGithub className="text-[#0f172a]" size={18} />
                <span className="text-sm font-medium text-[#475569]">GitHub</span>
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-[#64748b]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#3b82f6] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

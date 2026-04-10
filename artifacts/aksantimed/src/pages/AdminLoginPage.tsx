import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { HeartPulse, LogIn, Eye, EyeOff, ShieldCheck, AlertTriangle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const API_BASE = `${BASE}/api`;

export default function AdminLoginPage() {
  const { adminLogin, isAdminAuthenticated } = useAdminAuth();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAdminAuthenticated) navigate("/admin");
  }, [isAdminAuthenticated, navigate]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      adminLogin(data.token);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-[#8B0000] items-center justify-center mb-4 shadow-lg">
            <HeartPulse className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Aksantimed Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to the admin dashboard</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5 text-[#8B0000]">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Admin Access</span>
          </div>

          {!isLoading && isAuthenticated && user?.role === "customer" && (
            <div className="flex flex-col gap-3 mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed">
                  You're signed in as a customer account ({user.email}). This page is for admin access only.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full border-amber-300 text-amber-800 hover:bg-amber-100 gap-1.5 h-8 text-xs"
                onClick={() => navigate("/account")}
              >
                <User className="h-3 w-3" />
                Go to my account
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
                className="mt-1 h-10"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#8B0000] hover:bg-[#6d0000] text-white rounded-lg gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          <a href="/" className="hover:text-[#8B0000] transition-colors">← Back to website</a>
        </p>
      </div>
    </div>
  );
}

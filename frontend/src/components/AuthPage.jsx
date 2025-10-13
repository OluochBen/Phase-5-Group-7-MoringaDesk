import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { authApi } from "../services/api";

export function AuthPage({ defaultTab = "login", onLogin, onRegister }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(defaultTab);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ redirect users by role
  function redirectByRole(user) {
    if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  }

  // --- LOGIN ---
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔑 login with backend
      await authApi.login(email, password);
      const me = await authApi.me();
      const user = me.user ?? me;
      onLogin?.(user);

      redirectByRole(user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  // --- REGISTER ---
  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // always student unless changed manually
      await authApi.register(name, email, password, "student");
      const me = await authApi.me();
      const user = me.user ?? me;
      onRegister?.(user);

      redirectByRole(user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 pt-24 pb-16 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MoringaDesk</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your Q&A Platform for Learning
          </p>

          <div className="mt-6 flex flex-col items-center">
            <div className="inline-flex items-center space-x-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-base font-medium">
                Welcome to MoringaDesk
              </span>
            </div>
            <span className="text-sm text-muted-foreground mt-1">
              Sign in to continue your learning journey
            </span>
          </div>
        </div>

        {/* Auth tabs */}
        <Card className="border border-emerald-100 bg-white shadow-lg shadow-emerald-100/40">
          <CardContent className="p-6">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <div className="flex items-center justify-center mb-6">
                <TabsList className="w-full rounded-full bg-emerald-50 p-1">
                  <TabsTrigger
                    value="login"
                    className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:text-emerald-600"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:text-emerald-600"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="relative">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="mt-1"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      className="text-green-700 hover:underline"
                      onClick={() => navigate("/reset-password")}
                    >
                      Forgot your password?
                    </button>
                    <button
                      type="button"
                      className="text-muted-foreground hover:underline"
                      onClick={() => setTab("signup")}
                    >
                      Create account
                    </button>
                  </div>
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700"
                  >
                    {loading ? "Signing in…" : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="signup">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email2" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email2"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="relative">
                    <Label htmlFor="password2" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="password2"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      className="mt-1"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div>
                    <Label htmlFor="confirm" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm"
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="mt-1"
                    />
                  </div>
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700"
                  >
                    {loading ? "Creating Account…" : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing, you agree to our
              <button
                type="button"
                className="mx-1 text-emerald-600 hover:underline"
                onClick={() => navigate("/terms")}
              >
                Terms of Service
              </button>
              and
              <button
                type="button"
                className="mx-1 text-emerald-600 hover:underline"
                onClick={() => navigate("/privacy")}
              >
                Privacy Policy
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

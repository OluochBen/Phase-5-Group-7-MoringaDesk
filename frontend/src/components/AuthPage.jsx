import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Label } from "./ui/label";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { authApi } from "../services/api";
import { mockUsers } from "../data/mockData";

export function AuthPage({ defaultTab = "login", onLogin, onRegister }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(defaultTab);

  // shared form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Only "student" or "admin"
  const demoAccounts = useMemo(
    () => [
      { id: "student", name: "John Doe", email: "john@example.com", password: "password123", role: "student" },
      { id: "admin", name: "Jane Smith", email: "admin@moringadesk.com", password: "admin123", role: "admin" },
    ],
    []
  );

  const DEMO_MODE = !import.meta.env.VITE_API_BASE;

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (DEMO_MODE) {
        const acc = demoAccounts.find((a) => a.email === email && a.password === password);
        if (!acc) throw new Error("Invalid demo credentials");

        const matched = mockUsers.find((u) => u.email === acc.email) || {
          id: "demo",
          name: acc.name,
          email: acc.email,
          role: acc.role,
        };

        localStorage.setItem("access_token", "demo-token");
        onLogin?.(matched);
      } else {
        const { access_token } = await authApi.login(email, password);
        localStorage.setItem("access_token", access_token);

        const me = await authApi.me();
        // backend returns { user: {...} } or user object
        onLogin?.(me.user ?? me);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      if (DEMO_MODE) {
        const newUser = { id: String(Date.now()), name, email, role: "student" };
        localStorage.setItem("access_token", "demo-token");
        onRegister?.(newUser);
      } else {
        // ✅ send "student" as default role
        const { access_token } = await authApi.register(name, email, password, "student");
        localStorage.setItem("access_token", access_token);

        const me = await authApi.me();
        onRegister?.(me.user ?? me);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 pt-24 pb-16 px-4">
      <div className="max-w-md mx-auto">
        {/* Brand and greeting */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mb-3">
            <span className="text-white font-bold">M</span>
          </div>
          <h1 className="text-xl font-semibold">MoringaDesk</h1>
          <p className="text-xs text-muted-foreground">Your Q&A Platform for Learning</p>

          <div className="mt-4 flex flex-col items-center">
            <Avatar className="w-16 h-16 border-4 border-white shadow-md">
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <div className="mt-2 inline-flex items-center space-x-1 text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Welcome back, study buddy!</span>
            </div>
            <span className="text-xs text-muted-foreground">Ready to learn something new today?</span>
          </div>
        </div>

        {/* Quick demo access */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Quick Demo Access</CardTitle>
            <p className="text-xs text-muted-foreground">Try the platform with demo accounts</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                  setTab("login");
                }}
                className="w-full flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-600" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{acc.name}</div>
                    <div className="text-xs text-muted-foreground">{acc.email}</div>
                  </div>
                </div>
                {/* ✅ role is always a string now */}
                <Badge variant={acc.role === "admin" ? "destructive" : "secondary"}>
                  {acc.role}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Auth tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <div className="flex items-center justify-center mb-4">
                <TabsList className="w-full">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </div>

              {/* Login */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                  </div>
                  <div className="relative">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
                    <button type="button" className="absolute right-2 bottom-2.5 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword((s) => !s)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <button type="button" className="text-green-700 hover:underline" onClick={() => navigate("/reset-password")}>
                      Forgot your password?
                    </button>
                    <button type="button" className="text-muted-foreground hover:underline" onClick={() => setTab("signup")}>
                      Create account
                    </button>
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                    {loading ? "Signing in…" : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup */}
              <TabsContent value="signup">
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
                  </div>
                  <div>
                    <Label htmlFor="email2">Email</Label>
                    <Input id="email2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                  </div>
                  <div className="relative">
                    <Label htmlFor="password2">Password</Label>
                    <Input id="password2" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
                    <button type="button" className="absolute right-2 bottom-2.5 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword((s) => !s)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div>
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <Input id="confirm" type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm your password" />
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                    {loading ? "Creating…" : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

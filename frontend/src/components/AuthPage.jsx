import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Eye, EyeOff, CheckCircle2, Github, Facebook } from "lucide-react";
import GoogleIcon from "./icons/GoogleIcon";
import { authApi, buildSocialAuthUrl } from "../services/api";

export function AuthPage({ defaultTab = "login", onLogin, onRegister }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(defaultTab);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const socialProviders = useMemo(
    () => [
      {
        id: "google",
        label: "Continue with Google",
        signupLabel: "Sign up with Google",
        icon: <GoogleIcon className="h-4 w-4" />,
        className: "border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50",
      },
      {
        id: "github",
        label: "Continue with GitHub",
        signupLabel: "Sign up with GitHub",
        icon: <Github className="h-4 w-4" />,
        className: "bg-slate-900 text-white hover:bg-slate-800",
      },
      {
        id: "facebook",
        label: "Continue with Facebook",
        signupLabel: "Sign up with Facebook",
        icon: <Facebook className="h-4 w-4" />,
        className: "bg-[#1877F2] text-white hover:bg-[#0f5fd0]",
      },
    ],
    []
  );

  const allowSwitch = defaultTab === "combined";
  const activeTab = allowSwitch ? tab : defaultTab;

  const socialCallbackUrl = useMemo(() => {
    if (import.meta.env.VITE_SOCIAL_AUTH_CALLBACK_URL) {
      return import.meta.env.VITE_SOCIAL_AUTH_CALLBACK_URL;
    }
    if (typeof window !== "undefined") {
      return `${window.location.origin}/auth/callback`;
    }
    return "/auth/callback";
  }, []);

  function redirectByRole(user) {
    if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
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

  const handleSocialLogin = useCallback(
    (providerId, intent) => {
      setError("");
      try {
        const target = buildSocialAuthUrl(providerId, {
          redirectUrl: socialCallbackUrl,
          intent,
          state: intent,
        });
        window.location.href = target;
      } catch (err) {
        console.error(`Unable to start ${providerId} sign-in`, err);
        setError("Unable to start social sign-in right now. Please try again.");
      }
    },
    [socialCallbackUrl]
  );

  const renderSocialButtons = (intent) =>
    socialProviders.map((provider) => {
      const text = intent === "signup" ? provider.signupLabel : provider.label;
      return (
        <Button
          key={`${intent}-${provider.id}`}
          type="button"
          disabled={loading}
          onClick={() => handleSocialLogin(provider.id, intent)}
          className={`w-full justify-center rounded-xl py-3 text-sm font-semibold transition ${provider.className}`}
        >
          <span className="mr-2">{provider.icon}</span>
          {text}
        </Button>
      );
    });

  const divider = (
    <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
      <div className="h-px flex-1 bg-slate-200" />
      <span>or</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 pt-24 pb-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MoringaDesk</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your Q&amp;A Platform for Learning
          </p>
          <div className="mt-6 flex flex-col items-center">
            <div className="inline-flex items-center space-x-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-base font-medium">Welcome to MoringaDesk</span>
            </div>
            <span className="text-sm text-muted-foreground mt-1">
              {tab === "login"
                ? "Sign in to continue your learning journey"
                : "Create an account to join the community"}
            </span>
          </div>
        </div>

        <Card className="border border-emerald-100 bg-white shadow-xl shadow-emerald-100/50">
          <CardHeader className="pb-0 text-center">
            <CardTitle className="text-2xl font-semibold text-slate-900">
              {activeTab === "login" ? "Welcome back" : "Join MoringaDesk"}
            </CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              {activeTab === "login"
                ? "Sign in with your existing account or use a social provider."
                : "Sign up with email or use a trusted social provider."}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs
              value={activeTab}
              onValueChange={allowSwitch ? setTab : undefined}
              className="w-full"
            >
              {allowSwitch && (
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
              )}

              <TabsContent value="login">
                {(() => {
                  const loginButtons = renderSocialButtons("login");
                  return (
                    <div className="space-y-5">
                      {loginButtons.length > 0 && (
                        <>
                          <div className="space-y-3">{loginButtons}</div>
                          {divider}
                        </>
                      )}
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
                        placeholder="you@example.com"
                        required
                        className="mt-2 h-11 rounded-xl border border-emerald-100 bg-emerald-50/40 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="h-11 rounded-xl border border-emerald-100 bg-emerald-50/40 pr-12 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword((s) => !s)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-start text-sm">
                      <button
                        type="button"
                        className="text-emerald-700 hover:underline"
                        onClick={() => navigate("/reset-password")}
                      >
                        Forgot password?
                      </button>
                    </div>
                    {error && (
                      <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
                    )}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-full bg-green-600 text-base font-semibold text-white hover:bg-green-700"
                    >
                      {loading ? "Signing in…" : "Sign In"}
                    </Button>
                  </form>
                  <p className="text-center text-xs text-slate-500">
                    Don’t have an account?{" "}
                    <button
                      type="button"
                      className="font-semibold text-emerald-600 hover:underline"
                      onClick={() => navigate("/register")}
                    >
                      Sign up
                    </button>
                  </p>
                    </div>
                  );
                })()}
              </TabsContent>

              <TabsContent value="signup">
                {(() => {
                  const signupButtons = renderSocialButtons("signup");
                  return (
                    <div className="space-y-5">
                      <div className="space-y-3">{signupButtons}</div>
                      {signupButtons.length > 0 && divider}
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium">
                            Full name
                          </Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                            className="mt-2 h-11 rounded-xl border border-emerald-100 bg-emerald-50/40 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
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
                            placeholder="you@example.com"
                            required
                            className="mt-2 h-11 rounded-xl border border-emerald-100 bg-emerald-50/40 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password2" className="text-sm font-medium">
                            Password
                          </Label>
                          <div className="relative mt-2">
                            <Input
                              id="password2"
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Create a password"
                              required
                              className="h-11 rounded-xl border border-emerald-100 bg-emerald-50/40 pr-12 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowPassword((s) => !s)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="confirm" className="text-sm font-medium">
                            Confirm password
                          </Label>
                          <Input
                            id="confirm"
                            type={showPassword ? "text" : "password"}
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="Re-enter your password"
                            required
                            className="mt-2 h-11 rounded-xl border border-emerald-100 bg-emerald-50/40 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                        {error && (
                          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
                        )}
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-11 rounded-full bg-green-600 text-base font-semibold text-white hover:bg-green-700"
                        >
                          {loading ? "Creating Account…" : "Create Account"}
                        </Button>
                      </form>
                      <p className="text-center text-xs text-slate-500">
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="font-semibold text-emerald-600 hover:underline"
                          onClick={() => navigate("/login")}
                        >
                          Log in
                        </button>
                      </p>
                    </div>
                  );
                })()}
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

export default AuthPage;

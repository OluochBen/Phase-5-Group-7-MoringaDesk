import React, { useMemo, useState } from "react";
import { Eye, EyeOff, CheckCircle, Mail, Lock, ArrowLeft, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { authApi } from "../services/api";

export function PasswordReset({ onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState("request"); // request, verify, reset, success
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    token: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const steps = useMemo(
    () => [
      { id: "request", title: "Request", description: "Send reset link" },
      { id: "verify", title: "Verify", description: "Enter token" },
      { id: "reset", title: "Reset", description: "Create password" },
      { id: "success", title: "Done", description: "All set" },
    ],
    []
  );

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 8;

  // Step 1: Request reset email
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateEmail(formData.email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.requestPasswordReset(formData.email);
      setCurrentStep("verify");
    } catch (err) {
      setErrors({
        email:
          err.response?.data?.error ||
          "Failed to send reset email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: User pastes token from email
  const handleVerifyToken = (e) => {
    e.preventDefault();
    setErrors({});
    if (!formData.token) {
      setErrors({ token: "Please enter the reset token from your email" });
      return;
    }
    setCurrentStep("reset");
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validatePassword(formData.password)) {
      setErrors({ password: "Password must be at least 8 characters long" });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(formData.token, formData.password);
      setCurrentStep("success");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      setErrors({
        password:
          err.response?.data?.error ||
          "Failed to reset password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "request":
        return (
          <form onSubmit={handleRequestReset} className="flex flex-col h-full">
            <CardHeader className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Mail className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl font-semibold">Reset Your Password</CardTitle>
              <CardDescription>
                Enter your email address and we’ll send you a secure reset link.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div>
                <Label htmlFor="reset-email" className="text-sm font-medium text-slate-700">
                  Email Address
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`mt-2 h-11 rounded-xl bg-emerald-50/30 border border-emerald-100 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 ${
                    errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""
                  }`}
                  required
                />
                <p className="mt-2 text-xs text-slate-500">
                  We’ll send a one-time passcode to this email if it’s registered.
                </p>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-0 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-full border border-slate-200 text-slate-600 sm:w-auto"
                onClick={onClose}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-emerald-600 font-semibold hover:bg-emerald-700 sm:w-auto"
              >
                {isLoading ? "Sending…" : "Send reset link"}
              </Button>
            </CardFooter>
          </form>
        );

      case "verify":
        return (
          <form onSubmit={handleVerifyToken} className="flex flex-col h-full">
            <CardHeader className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Shield className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl font-semibold">Check your email</CardTitle>
              <CardDescription>
                Paste the one-time passcode we just sent to your inbox. It expires in 15 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={formData.token}
                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                className={`h-12 rounded-xl bg-emerald-50/30 text-center text-lg tracking-[0.3em] uppercase border border-emerald-100 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 ${
                  errors.token ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""
                }`}
                required
              />
              {errors.token && <p className="text-sm text-red-600 text-center">{errors.token}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-0 sm:flex-row sm:justify-end">
              <Button
                type="submit"
                className="w-full rounded-full bg-emerald-600 font-semibold hover:bg-emerald-700 sm:w-auto"
              >
                Continue
              </Button>
            </CardFooter>
          </form>
        );

      case "reset":
        return (
          <form onSubmit={handleResetPassword} className="flex flex-col h-full">
            <CardHeader className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Lock className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl font-semibold">Create a new password</CardTitle>
              <CardDescription>
                Use at least 8 characters, mixing letters, numbers, or symbols for a stronger password.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">New password</Label>
                <div className="relative mt-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`h-11 rounded-xl bg-emerald-50/30 border border-emerald-100 pr-12 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 ${
                      errors.password ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Confirm password</Label>
                <Input
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={`mt-2 h-11 rounded-xl bg-emerald-50/30 border border-emerald-100 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 ${
                    errors.confirmPassword ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""
                  }`}
                  required
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-0 sm:flex-row sm:justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-emerald-600 font-semibold hover:bg-emerald-700 sm:w-auto"
              >
                {isLoading ? "Updating…" : "Update password"}
              </Button>
            </CardFooter>
          </form>
        );

      case "success":
        return (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <CardTitle className="mt-4 text-2xl font-semibold text-slate-900">
              Password reset successful
            </CardTitle>
            <CardDescription className="mt-2 max-w-sm text-slate-600">
              You can now sign in with your new password. We’ll take you back in a moment.
            </CardDescription>
            <Button onClick={onClose} className="mt-6 rounded-full bg-emerald-600 font-semibold hover:bg-emerald-700">
              Continue to sign in
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-500">
            Follow the steps below to regain access to your account. It only takes a minute.
          </p>
        </div>

        <div className="mb-8 grid w-full max-w-2xl grid-cols-4 gap-3 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
          {steps.map((step, index) => {
            const stepIndex = steps.findIndex((item) => item.id === currentStep);
            const isCompleted = index < stepIndex;
            const isActive = index === stepIndex;
            return (
              <div
                key={step.id}
                className={`rounded-xl border px-3 py-2 transition-colors ${
                  isActive
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : isCompleted
                    ? "border-emerald-100 bg-emerald-25 text-emerald-500"
                    : "border-slate-200 bg-white"
                }`}
              >
                <p>{step.title}</p>
                <p className="mt-1 text-[10px] capitalization text-slate-400">{step.description}</p>
              </div>
            );
          })}
        </div>

        <Card className="w-full max-w-xl border border-emerald-100 bg-white shadow-xl shadow-emerald-100/50">
          {renderStep()}
        </Card>
      </div>
    </div>
  );
}

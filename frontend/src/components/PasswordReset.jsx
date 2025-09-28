import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle, Mail, Lock } from "lucide-react";
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
          <form onSubmit={handleRequestReset}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>Reset Your Password</span>
              </CardTitle>
              <CardDescription>
                Enter your email address and we’ll send you a reset link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={errors.email ? "border-red-500" : ""}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </CardContent>
            <CardFooter className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </CardFooter>
          </form>
        );

      case "verify":
        return (
          <form onSubmit={handleVerifyToken}>
            <CardHeader>
              <CardTitle>Check Your Email</CardTitle>
              <CardDescription>
                Paste the reset token from your email below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Paste reset token"
                value={formData.token}
                onChange={(e) =>
                  setFormData({ ...formData, token: e.target.value })
                }
                className={errors.token ? "border-red-500" : ""}
                required
              />
              {errors.token && (
                <p className="text-sm text-red-600">{errors.token}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit">Continue</Button>
            </CardFooter>
          </form>
        );

      case "reset":
        return (
          <form onSubmit={handleResetPassword}>
            <CardHeader>
              <CardTitle>Create New Password</CardTitle>
            </CardHeader>
            <CardContent>
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={errors.password ? "border-red-500" : ""}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                className={errors.confirmPassword ? "border-red-500" : ""}
                required
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        );

      case "success":
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-xl mb-2">
              Password Reset Successful!
            </CardTitle>
            <CardDescription className="mb-6">
              You can now sign in with your new password.
            </CardDescription>
            <Button onClick={onClose}>Continue to Sign In</Button>
          </div>
        );
    }
  };

  return <Card className="w-full max-w-md mx-auto">{renderStep()}</Card>;
}

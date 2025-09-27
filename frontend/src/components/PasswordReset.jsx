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
import { Alert, AlertDescription } from "./ui/alert";
import { authApi } from "../services/api";

export function PasswordReset({ onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState("request"); // request, verify, reset, success
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 8;

  // --- Step 1: Request reset
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

  // --- Step 2: Verify OTP
  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setErrors({});
    if (formData.token.length !== 6) {
      setErrors({ token: "Please enter the 6-digit code" });
      return;
    }

    // Instead of calling backend here, move directly to reset step
    // since reset endpoint will validate OTP or token
    setCurrentStep("reset");
  };

  // --- Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validatePassword(formData.newPassword)) {
      setErrors({
        newPassword: "Password must be at least 8 characters long",
      });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsLoading(true);
    try {
      // Here we assume OTP flow
      await authApi.resetPasswordWithOtp(
        formData.email,
        formData.token,
        formData.newPassword
      );
      setCurrentStep("success");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      setErrors({
        newPassword:
          err.response?.data?.error ||
          "Failed to reset password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render steps
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
                Enter your email address and we'll send you a verification code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </Button>
            </CardFooter>
          </form>
        );

      case "verify":
        return (
          <form onSubmit={handleVerifyToken}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Check Your Email</span>
              </CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to <strong>{formData.email}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={formData.token}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    token: e.target.value.replace(/\D/g, "").substring(0, 6),
                  })
                }
                className={`text-center text-2xl tracking-wider ${
                  errors.token ? "border-red-500" : ""
                }`}
                maxLength={6}
                required
              />
              {errors.token && (
                <p className="text-sm text-red-600">{errors.token}</p>
              )}
            </CardContent>
            <CardFooter className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep("request")}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isLoading || formData.token.length !== 6}
              >
                Continue
              </Button>
            </CardFooter>
          </form>
        );

      case "reset":
        return (
          <form onSubmit={handleResetPassword}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-purple-600" />
                <span>Create New Password</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className={errors.newPassword ? "border-red-500" : ""}
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
              {errors.newPassword && (
                <p className="text-sm text-red-600">{errors.newPassword}</p>
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
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
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
            <Button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700"
            >
              Continue to Sign In
            </Button>
          </div>
        );
    }
  };

  return <Card className="w-full max-w-md mx-auto">{renderStep()}</Card>;
}

import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Lock } from "lucide-react";
import logoImage from "@/assets/logo.avif";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/auth-api";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const emailFromUrl = searchParams.get("email") || "";

  const [step, setStep] = useState<1 | 2>(1); // 1: Verify OTP, 2: Reset Password
  const [resetToken, setResetToken] = useState("");
  const [formData, setFormData] = useState({
    email: emailFromUrl,
    otpCode: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.otpCode) {
      toast.error("Please enter your email and verification code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verifyResetOTP(
        formData.email,
        formData.otpCode,
      );
      setResetToken(response.resetToken);
      setStep(2);
      toast.success("Code verified! Please set your new password.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message ||
          "Invalid or expired verification code.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.resetPassword(
        formData.email,
        resetToken,
        formData.newPassword,
      );

      toast.success(response.message || "Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message ||
          "Failed to reset password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4" style={{ maxWidth: "32rem" }}>
      {/* Logo */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="size-12">
            <img src={logoImage} alt="logo" />
          </div>
          <span className="text-2xl font-bold text-text">Morphee</span>
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-bg-card p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-text">
          {step === 1 ? "Verify Code" : "Set New Password"}
        </h1>
        <p className="mb-8 text-center text-text-muted">
          {step === 1
            ? "Enter the verification code sent to your email"
            : "Choose a strong password for your account"}
        </p>

        {step === 1 ? (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
              disabled={!!emailFromUrl}
            />

            <Input
              label="Verification Code"
              type="text"
              name="otpCode"
              value={formData.otpCode}
              onChange={handleChange}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              Verify Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              <Lock className="mr-2 h-5 w-5" />
              Reset Password
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

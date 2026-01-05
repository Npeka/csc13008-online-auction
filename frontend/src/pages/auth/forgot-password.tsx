import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router";
import { ArrowLeft, Mail } from "lucide-react";
import logoImage from "@/assets/logo.avif";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/auth-api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      setEmailSent(true);
      toast.success(
        response.message || "Verification code sent to your email!",
      );

      // Show OTP in development
      if (response.otpCode) {
        console.log("🔐 Development OTP Code:", response.otpCode);
        toast.success(`Dev OTP: ${response.otpCode}`, { duration: 10000 });
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message ||
          "Failed to send verification code. Please try again.",
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
        {!emailSent ? (
          <>
            <h1 className="mb-2 text-center text-2xl font-bold text-text">
              Forgot Password?
            </h1>
            <p className="mb-8 text-center text-text-muted">
              Enter your email and we'll send you a verification code to reset
              your password
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                size="lg"
              >
                Send Verification Code
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
              <Mail className="h-8 w-8 text-success" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-text">
              Check Your Email
            </h2>
            <p className="mb-4 text-text-muted">
              We've sent a 6-digit verification code to
            </p>
            <p className="font-semibold text-text">{email}</p>
            <div className="rounded-lg bg-bg-secondary p-4">
              <p className="text-sm text-text-muted">
                The code will expire in <strong>5 minutes</strong>
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Enter the code on the next page to reset your password
              </p>
            </div>
            <Link to={`/reset-password?email=${encodeURIComponent(email)}`}>
              <Button className="w-full" size="lg">
                Enter Code & Reset Password
              </Button>
            </Link>
            <p className="mt-4 text-sm text-text-muted">
              Didn't receive the code?{" "}
              <button
                onClick={() => setEmailSent(false)}
                className="text-primary hover:underline"
              >
                Resend code
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

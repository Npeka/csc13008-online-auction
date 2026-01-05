import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import { Lock, Mail, MapPin, User } from "lucide-react";
import logoImage from "@/assets/logo.avif";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, verifyEmail, resendOtp, isLoading } = useAuthStore();

  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    agreeToTerms: false,
  });
  const [otp, setOtp] = useState("");
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isSubmittingOtp = useRef(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms";
    }

    if (!captchaValue) {
      newErrors.captcha = "Please complete the CAPTCHA";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        address: formData.address,
      });

      if (result.success) {
        toast.success(result.message || "Verification code sent to your email");
        setStep("otp");
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed",
      );
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (otp.length !== 6 || isSubmittingOtp.current) return;

    isSubmittingOtp.current = true;

    try {
      const success = await verifyEmail(formData.email, otp);
      if (success) {
        toast.success("Account verified successfully!");
        navigate("/");
      } else {
        toast.error("Invalid verification code");
        isSubmittingOtp.current = false;
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Verification failed",
      );
      isSubmittingOtp.current = false;
    }
  };

  // Auto-submit when OTP is 6 digits
  useEffect(() => {
    if (otp.length === 6 && step === "otp") {
      handleVerifyOtp();
    }
  }, [otp]);

  const handleResendOtp = async () => {
    try {
      const result = await resendOtp(formData.email);
      if (result.success) {
        toast.success("Verification code resent!");
      } else {
        toast.error(result.message || "Failed to resend code");
      }
    } catch (error) {
      toast.error("Failed to resend code");
    }
  };

  if (step === "otp") {
    return (
      <div className="w-full px-4" style={{ maxWidth: "32rem" }}>
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="size-12">
              <img src={logoImage} alt="logo" />
            </div>
            <span className="text-2xl font-bold text-text">Morphee</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-bg-card p-8 shadow-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-text">
              Verify Your Email
            </h1>
            <p className="text-text-muted">
              We've sent a 6-digit code to <strong>{formData.email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="mb-2 block text-center text-sm font-medium text-text">
                Enter verification code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                disabled={isLoading}
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-4 text-center text-3xl tracking-[0.5em] text-text disabled:cursor-not-allowed disabled:opacity-70"
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              Verify Email
            </Button>

            <button
              type="button"
              onClick={handleResendOtp}
              className="w-full text-center text-sm text-primary hover:underline"
            >
              Didn't receive the code? Resend
            </button>

            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full cursor-pointer text-center text-text-muted transition-colors hover:text-text"
            >
              ← Back to registration
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4" style={{ maxWidth: "32rem" }}>
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="size-12">
            <img src={logoImage} alt="logo" />
          </div>
          <span className="text-2xl font-bold text-text">Morphee</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-bg-card p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-text">
          Create Account
        </h1>
        <p className="mb-8 text-center text-text-muted">
          Join our marketplace community
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            leftIcon={<User className="h-5 w-5" />}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            leftIcon={<Mail className="h-5 w-5" />}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock className="h-5 w-5" />}
              hint="Min. 6 characters"
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              leftIcon={<Lock className="h-5 w-5" />}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute top-3 left-3 h-5 w-5 text-text-muted" />
              <textarea
                name="address"
                placeholder="123 Main Street, City, Country"
                value={formData.address}
                onChange={handleChange}
                className={cn(
                  "min-h-[80px] w-full resize-none rounded-lg py-2.5 pr-4 pl-10",
                  "border border-border bg-bg-card",
                  "text-text placeholder:text-text-muted",
                  "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
                  errors.address && "border-error",
                )}
              />
            </div>
            {errors.address && (
              <p className="mt-1.5 text-sm text-error">{errors.address}</p>
            )}
          </div>

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ""}
              onChange={(value) => {
                setCaptchaValue(value);
                setErrors((prev) => ({ ...prev, captcha: "" }));
              }}
            />
          </div>
          {errors.captcha && (
            <p className="text-center text-sm text-error">{errors.captcha}</p>
          )}

          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 rounded border-border"
            />
            <span className="text-sm text-text-secondary">
              I agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="text-sm text-error">{errors.agreeToTerms}</p>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            Create Account
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-bg-card px-2 text-text-muted">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleSignInButton onSuccess={() => navigate("/")} />

        <p className="mt-6 text-center text-text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

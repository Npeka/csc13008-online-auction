import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, User, MapPin, Github, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import logoImage from "@/assets/logo.avif";
import toast from "react-hot-toast";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

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
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Simulate sending OTP
    toast.success("Verification code sent to your email");
    setStep("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        address: formData.address,
      });
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed",
      );
    }
  };

  if (step === "otp") {
    return (
      <div className="w-full px-4" style={{ maxWidth: "32rem" }}>
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center">
            <div className="size-24">
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
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-4 text-center text-3xl tracking-[0.5em] text-text"
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
        <Link to="/" className="inline-flex items-center">
          <div className="size-24">
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

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            leftIcon={<Lock className="h-5 w-5" />}
            hint="Minimum 6 characters"
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

          {/* reCAPTCHA placeholder */}
          <div className="rounded-lg border border-border bg-bg-secondary p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary-light">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text">I'm not a robot</p>
                <p className="text-xs text-text-muted">reCAPTCHA</p>
              </div>
            </div>
          </div>

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

        <div className="grid grid-cols-3 gap-3">
          <button className="flex cursor-pointer items-center justify-center rounded-lg border border-border p-3 transition-colors hover:bg-bg-secondary">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </button>
          <button className="flex cursor-pointer items-center justify-center rounded-lg border border-border p-3 transition-colors hover:bg-bg-secondary">
            <svg
              className="h-5 w-5 text-[#1877F2]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
          <button className="flex cursor-pointer items-center justify-center rounded-lg border border-border p-3 transition-colors hover:bg-bg-secondary">
            <Github className="h-5 w-5" />
          </button>
        </div>

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

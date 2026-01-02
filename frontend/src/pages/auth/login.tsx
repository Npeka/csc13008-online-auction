import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import { Lock,Mail } from "lucide-react";
import logoImage from "@/assets/logo.avif";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <div className="w-full px-4" style={{ maxWidth: "32rem" }}>
      {/* Logo */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center">
          <div className="size-12">
            <img src={logoImage} alt="logo" />
          </div>
          <span className="text-2xl font-bold text-text">Morphee</span>
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-bg-card p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-text">
          Welcome Back
        </h1>
        <p className="mb-8 text-center text-text-muted">
          Sign in to continue to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="rounded border-border" />
              <span className="text-text-secondary">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            Sign In
          </Button>
        </form>

        {/* Divider */}
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

        {/* Social Login */}
        <GoogleSignInButton onSuccess={() => navigate("/")} />

        {/* Register Link */}
        <p className="mt-6 text-center text-text-muted">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

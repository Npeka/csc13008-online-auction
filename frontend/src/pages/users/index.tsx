import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { format } from "date-fns";
import { ArrowLeft, Calendar, ShieldCheck, ThumbsUp } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/badge";
import { usersApi } from "@/lib/users-api";

interface PublicProfile {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  rating: number;
  ratingCount: number;
  createdAt: string;
}

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await usersApi.getPublicProfile(id);
        setProfile(data);
      } catch {
        setError("User not found");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container-app flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="mb-4 text-2xl font-bold text-text">User Not Found</h1>
        <p className="mb-6 text-text-muted">
          The profile you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  const ratingPercent =
    profile.ratingCount > 0 ? Math.round((profile.rating / 5) * 100) : 0;

  return (
    <div className="container-app py-10">
      {/* Profile Card */}
      <div className="mx-auto">
        <div className="overflow-hidden rounded-2xl border border-border bg-bg-card shadow-lg">
          {/* Gradient Header */}
          <div className="h-24 bg-linear-to-r from-primary to-primary-light" />

          {/* Content */}
          <div className="relative px-8 pb-8">
            {/* Avatar - overlapping header */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <div className="rounded-full border-4 border-bg-card shadow-lg">
                <Avatar
                  src={profile.avatar ?? undefined}
                  alt={profile.name}
                  fallback={profile.name}
                  size="xl"
                  className="h-24 w-24"
                />
              </div>
            </div>

            {/* Spacer for avatar */}
            <div className="h-14" />

            {/* Name */}
            <h1 className="mb-2 text-center text-2xl font-bold text-text">
              {profile.name}
            </h1>

            {/* Role Badge */}
            <div className="mb-6 flex justify-center">
              <RoleBadge role={profile.role} />
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-bg-secondary p-5">
              {/* Rating */}
              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-success" />
                  <span className="text-2xl font-bold text-text">
                    {profile.ratingCount > 0 ? `${ratingPercent}%` : "—"}
                  </span>
                </div>
                <p className="text-sm text-text-muted">
                  {profile.ratingCount > 0
                    ? `${profile.ratingCount} ratings`
                    : "No ratings"}
                </p>
              </div>

              {/* Member Since */}
              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-text">
                    {format(new Date(profile.createdAt), "yyyy")}
                  </span>
                </div>
                <p className="text-sm text-text-muted">
                  Member since {format(new Date(profile.createdAt), "MMM")}
                </p>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="rounded-lg border border-success-light bg-success-light p-4 text-center">
              <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-success" />
              <p className="text-sm text-success">
                Protected by Morphee Buyer Guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Gavel, Heart, Star, Trophy } from "lucide-react";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { ProfileAuthGuard } from "@/components/profile/ProfileAuthGuard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { QuickLinks } from "@/components/profile/QuickLinks";
import { SectionCard } from "@/components/profile/SectionCard";
import { SellerSettingsCard } from "@/components/profile/SellerSettingsCard";
import { SellerStatusBanner } from "@/components/profile/SellerStatusBanner";
import { StatsGrid } from "@/components/profile/StatsGrid";
import { UpgradeBanner } from "@/components/profile/UpgradeBanner";
import { UpgradeRequestModal } from "@/components/shared/upgrade-request-modal";
import { UpgradeRequestStatus } from "@/components/profile/UpgradeRequestStatus";
import { useAuthStore } from "@/stores/auth-store";
import { usersApi } from "@/lib/users-api";
import { useProfile } from "@/hooks/use-profile";

export function ProfilePage() {
  const { isAuthenticated } = useAuthStore();
  const { data: user, isLoading, error } = useProfile();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasUpgradeRequests, setHasUpgradeRequests] = useState(false);
  const [upgradeRequestsKey, setUpgradeRequestsKey] = useState(0); // Key to force refetch

  // Fetch upgrade requests to determine if user has any
  useEffect(() => {
    if (user?.role === "BIDDER") {
      usersApi
        .getUserUpgradeRequests({ limit: 1 })
        .then((response) => {
          setHasUpgradeRequests(response.data.length > 0);
        })
        .catch(() => {
          setHasUpgradeRequests(false);
        });
    }
  }, [user?.role, upgradeRequestsKey]); // Also refetch when key changes

  const handleUpgradeRequest = async (reason: string) => {
    await usersApi.createUpgradeRequest(reason);
    setHasUpgradeRequests(true); // Update state after creating request
  };

  const handleUpgradeSuccess = () => {
    // Increment key to force refetch/remount of UpgradeRequestStatus
    setUpgradeRequestsKey((prev) => prev + 1);
  };

  if (!isAuthenticated) {
    return <ProfileAuthGuard>{null}</ProfileAuthGuard>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container-app flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Error or no user state
  if (error || !user) {
    return <ProfileAuthGuard>{null}</ProfileAuthGuard>;
  }

  const ratingPercent =
    typeof user.rating === "object" && user.rating.total > 0
      ? Math.round((user.rating.positive / user.rating.total) * 100)
      : 0;

  const stats = [
    {
      label: "Active Bids",
      value: 5,
      icon: <Gavel className="h-5 w-5" />,
      href: "/profile/bids",
    },
    {
      label: "Won Auctions",
      value: 12,
      icon: <Trophy className="h-5 w-5" />,
      href: "/profile/won",
    },
    {
      label: "Watchlist",
      value: 8,
      icon: <Heart className="h-5 w-5" />,
      href: "/profile/watchlist",
    },
    {
      label: "Rating",
      value: `${ratingPercent}%`,
      icon: <Star className="h-5 w-5" />,
      href: "/profile/ratings",
    },
  ];

  return (
    <ProfileAuthGuard>
      <div className="container-app py-10">
        <ProfileHeader user={user} />
        <SellerStatusBanner user={user} />
        <div className="mb-10 grid gap-8 md:grid-cols-2">
          <PersonalInfoCard user={user} />
          <SectionCard title="Change Password">
            <ChangePasswordForm />
          </SectionCard>
        </div>
        {/* Seller Settings - only show for sellers */}
        {(user.role === "SELLER" || user.role === "ADMIN") && (
          <div className="mb-10">
            <SellerSettingsCard user={user} />
          </div>
        )}
        <StatsGrid stats={stats} />
        <QuickLinks />
        {user.role === "BIDDER" && (
          <div className="mt-10 space-y-6">
            {hasUpgradeRequests ? (
              <UpgradeRequestStatus
                key={upgradeRequestsKey}
                onRequestAgain={() => setShowUpgradeModal(true)}
              />
            ) : (
              <UpgradeBanner onUpgrade={() => setShowUpgradeModal(true)} />
            )}
          </div>
        )}
        <UpgradeRequestModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onSubmit={handleUpgradeRequest}
          onSuccess={handleUpgradeSuccess}
        />
      </div>
    </ProfileAuthGuard>
  );
}

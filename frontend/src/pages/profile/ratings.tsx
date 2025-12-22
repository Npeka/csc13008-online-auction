import { RatingStats } from "@/components/shared/rating";
import { useAuthStore } from "@/stores/auth-store";

export function RatingsPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="container-app py-8 text-center">
        <p className="text-text-muted">Please login to view your ratings.</p>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <h1 className="mb-8 text-2xl font-bold text-text">My Ratings</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <h2 className="mb-4 font-semibold text-text">Rating Overview</h2>
          <RatingStats
            positive={user.rating.positive}
            total={user.rating.total}
          />
        </div>

        <div className="rounded-xl border border-border bg-bg-card p-6">
          <h2 className="mb-4 font-semibold text-text">Recent Feedback</h2>
          <p className="text-sm text-text-muted">No feedback received yet.</p>
        </div>
      </div>
    </div>
  );
}

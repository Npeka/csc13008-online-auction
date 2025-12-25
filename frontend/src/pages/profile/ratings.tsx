import { format } from "date-fns";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { RatingStats } from "@/components/shared/rating";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { getRatingsForUser } from "@/data/mock";
import { cn } from "@/lib/utils";

export function RatingsPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="container-app py-8 text-center">
        <p className="text-text-muted">Please login to view your ratings.</p>
      </div>
    );
  }

  const ratings = getRatingsForUser(user.id);

  return (
    <div className="container-app py-10">
      <h1 className="mb-8 text-2xl font-bold text-text">My Ratings</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Rating Overview */}
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <h2 className="mb-4 font-semibold text-text">Rating Overview</h2>
          <RatingStats
            positive={user.rating.positive}
            total={user.rating.total}
          />
        </div>

        {/* Summary Stats */}
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <h2 className="mb-4 font-semibold text-text">Feedback Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-success/10 p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <ThumbsUp className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold text-success">
                  {ratings.filter((r) => r.score === 1).length}
                </span>
              </div>
              <p className="mt-1 text-sm text-text-muted">Positive</p>
            </div>
            <div className="rounded-lg bg-error/10 p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <ThumbsDown className="h-5 w-5 text-error" />
                <span className="text-2xl font-bold text-error">
                  {ratings.filter((r) => r.score === -1).length}
                </span>
              </div>
              <p className="mt-1 text-sm text-text-muted">Negative</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedback List */}
      <div className="mt-8">
        <h2 className="mb-4 font-semibold text-text">Recent Feedback</h2>

        {ratings.length === 0 ? (
          <div className="rounded-xl border border-border bg-bg-card py-12 text-center">
            <MessageSquare className="mx-auto mb-3 h-12 w-12 text-text-muted" />
            <p className="text-text-muted">No feedback received yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="rounded-xl border border-border bg-bg-card p-4 transition-colors hover:border-border/80"
              >
                <div className="flex items-start gap-4">
                  {/* Rating Icon */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      rating.score === 1
                        ? "bg-success/10 text-success"
                        : "bg-error/10 text-error",
                    )}
                  >
                    {rating.score === 1 ? (
                      <ThumbsUp className="h-5 w-5" />
                    ) : (
                      <ThumbsDown className="h-5 w-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Avatar
                        src={rating.fromUser.avatar}
                        fallback={rating.fromUser.fullName}
                        size="xs"
                      />
                      <span className="font-medium text-text">
                        {rating.fromUser.fullName}
                      </span>
                      <span className="text-xs text-text-muted">
                        {format(new Date(rating.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-text-secondary">{rating.comment}</p>
                  </div>

                  {/* Score Badge */}
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      rating.score === 1
                        ? "bg-success/10 text-success"
                        : "bg-error/10 text-error",
                    )}
                  >
                    {rating.score === 1 ? "+1" : "-1"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

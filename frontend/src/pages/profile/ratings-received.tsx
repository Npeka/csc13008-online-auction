import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { ratingsApi, type Rating, type RatingSummary } from "@/lib/ratings-api";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export function RatingsReceivedPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchRatings = async () => {
      try {
        setIsLoading(true);
        const data = await ratingsApi.getMyReceivedRatings();
        setRatings(data.ratings);
        setSummary(data.summary);
      } catch (error) {
        console.error("Failed to fetch ratings:", error);
        toast.error("Failed to load ratings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="container-app flex min-h-screen items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">
            Ratings I've Received
          </h1>
          <p className="mt-2 text-text-muted">
            See what others have said about their experience with you
          </p>
        </div>

        {/* Summary Card */}
        {summary && (
          <div className="mb-8 grid grid-cols-1 gap-4 rounded-xl border border-border bg-bg-card p-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <Star className="h-6 w-6 fill-warning text-warning" />
              </div>
              <p className="text-3xl font-bold text-text">
                {summary.percentage}%
              </p>
              <p className="text-sm text-text-muted">Positive Rating</p>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-text">{summary.total}</p>
              <p className="text-sm text-text-muted">Total Ratings</p>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <ThumbsUp className="h-6 w-6 text-success" />
              </div>
              <p className="text-3xl font-bold text-success">
                {summary.positive}
              </p>
              <p className="text-sm text-text-muted">Positive</p>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <ThumbsDown className="h-6 w-6 text-error" />
              </div>
              <p className="text-3xl font-bold text-error">
                {summary.negative}
              </p>
              <p className="text-sm text-text-muted">Negative</p>
            </div>
          </div>
        )}

        {/* Ratings List */}
        <div className="space-y-4">
          {ratings.length === 0 ? (
            <div className="rounded-xl border border-border bg-bg-card p-12 text-center">
              <Star className="mx-auto mb-4 h-12 w-12 text-text-muted" />
              <h3 className="mb-2 text-lg font-semibold text-text">
                No Ratings Yet
              </h3>
              <p className="text-text-muted">
                You haven't received any ratings from other users yet.
              </p>
            </div>
          ) : (
            ratings.map((rating) => (
              <div
                key={rating.id}
                className="rounded-xl border border-border bg-bg-card p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar
                    src={rating.giver.avatar}
                    fallback={rating.giver.name}
                    size="md"
                  />

                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-text">
                          {rating.giver.name}
                        </p>
                        <p className="text-sm text-text-muted">
                          {formatDate(rating.createdAt)}
                        </p>
                      </div>
                      <div>
                        {rating.rating === 1 ? (
                          <div className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-success">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Positive
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 rounded-full bg-error/10 px-3 py-1 text-error">
                            <ThumbsDown className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Negative
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comment */}
                    {rating.comment && (
                      <div className="mt-3 rounded-lg bg-bg-secondary p-4">
                        <p className="text-text">{rating.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

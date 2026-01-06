import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { usersApi, type UpgradeRequest } from "@/lib/users-api";
import { SectionCard } from "./SectionCard";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface UpgradeRequestStatusProps {
  onRequestAgain?: () => void;
}

export function UpgradeRequestStatus({
  onRequestAgain,
}: UpgradeRequestStatusProps) {
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getUserUpgradeRequests({ limit: 5 });
      setRequests(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch upgrade requests:", err);
      setError("Failed to load upgrade requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-warning" />;
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-error" />;
      default:
        return <AlertCircle className="h-5 w-5 text-text-muted" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-warning/10 text-warning border-warning/30",
      APPROVED: "bg-success/10 text-success border-success/30",
      REJECTED: "bg-error/10 text-error border-error/30",
    };

    return (
      <span
        className={`rounded-full border px-3 py-1 text-xs font-medium ${
          styles[status as keyof typeof styles] || ""
        }`}
      >
        {status}
      </span>
    );
  };

  // Check if the most recent request is rejected
  const latestRequest = requests[0];
  const canRequestAgain = latestRequest?.status === "REJECTED";

  if (isLoading) {
    return (
      <SectionCard title="Your Upgrade Requests">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="Your Upgrade Requests">
        <div className="flex items-center gap-2 rounded-lg bg-error/10 p-4 text-error">
          <XCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      </SectionCard>
    );
  }

  if (requests.length === 0) {
    return null; // Don't show the section if there are no requests
  }

  return (
    <SectionCard title="Your Upgrade Requests">
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="rounded-lg border border-border bg-bg-secondary p-4 transition-colors hover:bg-bg-tertiary"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 items-start gap-3">
                <div className="mt-1">{getStatusIcon(request.status)}</div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    <span className="text-sm text-text-muted">
                      {format(new Date(request.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                  {request.reason && (
                    <p className="mb-2 text-sm text-text">
                      <strong>Your reason:</strong> {request.reason}
                    </p>
                  )}
                  {request.adminComment && (
                    <div className="rounded-md bg-bg-card p-2">
                      <p className="text-sm text-text-muted">
                        <strong className="text-text">Admin comment:</strong>{" "}
                        {request.adminComment}
                      </p>
                    </div>
                  )}
                  {request.status === "PENDING" && (
                    <p className="mt-2 text-xs text-text-muted">
                      Your request is being reviewed. You'll be notified once a
                      decision is made.
                    </p>
                  )}
                  {request.status === "APPROVED" && (
                    <p className="mt-2 text-xs text-success">
                      Your request was approved! You can now list items for
                      sale.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Show Request Again button if latest request is rejected */}
        {canRequestAgain && onRequestAgain && (
          <div className="rounded-lg border border-dashed border-border bg-bg-card p-4 text-center">
            <p className="mb-3 text-sm text-text-muted">
              Your previous request was rejected. You can submit a new request
              with additional information.
            </p>
            <Button onClick={onRequestAgain} size="sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              Request Again
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

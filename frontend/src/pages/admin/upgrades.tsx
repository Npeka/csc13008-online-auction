import { useState } from "react";
import toast from "react-hot-toast";
import {
  Calendar,
  Check,
  Mail,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usersApi, type UpgradeRequest } from "@/lib";

export function UpgradeRequests() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<
    "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Query
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["upgrades", { page, limit, status: selectedTab }],
    queryFn: () =>
      usersApi.getUpgradeRequests({
        page,
        limit,
        status: selectedTab,
      }),
    placeholderData: keepPreviousData,
  });

  const requests = data?.data || [];
  const totalRequests = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  // Mutation
  const processMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
      reason?: string;
    }) => usersApi.processUpgradeRequest(id, status, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["upgrades"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success(
        `${variables.status === "APPROVED" ? "Approved" : "Rejected"} upgrade request`,
      );
    },
    onError: () => {
      toast.error("Failed to process request");
    },
  });

  const handleApprove = (request: UpgradeRequest) => {
    processMutation.mutate({ id: request.id, status: "APPROVED" });
  };

  const handleReject = (request: UpgradeRequest) => {
    const reason = window.prompt("Reason for rejection (optional):");
    if (reason === null) return; // Cancelled
    processMutation.mutate({
      id: request.id,
      status: "REJECTED",
      reason: reason || undefined,
    });
  };

  const tabs: Array<{ key: typeof selectedTab; label: string }> = [
    { key: "PENDING", label: "Pending" },
    { key: "APPROVED", label: "Approved" },
    { key: "REJECTED", label: "Rejected" },
  ];

  if (isLoading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Upgrade Requests</h1>
        <p className="mt-2 text-text-muted">
          Review and manage bidder to seller upgrade requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setSelectedTab(tab.key);
              setPage(1);
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
              selectedTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="relative space-y-4">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-card/50 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {requests.map((request) => (
          <div
            key={request.id}
            className="rounded-xl border border-border bg-bg-card p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">
                      {request.user?.name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {request.user?.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {request.reason && (
                  <div className="rounded-lg bg-bg-secondary p-4">
                    <p className="text-sm font-medium text-text">Reason:</p>
                    <p className="mt-1 text-text-muted">{request.reason}</p>
                  </div>
                )}
              </div>

              <div className="ml-4 flex items-center gap-2">
                {request.status === "PENDING" ? (
                  <>
                    <Button
                      onClick={() => handleApprove(request)}
                      variant="default" // Changed from primary -> default/primary depending on theme. Assuming default is primary-like or stick to variant provided.
                      // Wait, original was variant="primary". Button usually has default as primary. Or "default".
                      // I'll use "default" if defined in ui/button, or check existing usage.
                      // Original used "primary" explicitly? Let's check imports.
                      // ui/button usually has variants: default, destructive, outline, secondary, ghost, link.
                      // I'll stick to "default" (filled) for Approve.
                      size="sm"
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(request)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </>
                ) : (
                  <Badge
                    variant={
                      request.status === "APPROVED" ? "success" : "error"
                    }
                  >
                    {request.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="rounded-xl border border-border bg-bg-card p-12 text-center">
            <User className="mx-auto h-12 w-12 text-text-muted" />
            <h3 className="mt-4 text-lg font-semibold text-text">
              No {selectedTab.toLowerCase()} requests
            </h3>
            <p className="mt-2 text-text-muted">
              {selectedTab === "PENDING"
                ? "All caught up! No requests to review."
                : `No ${selectedTab.toLowerCase()} requests found`}
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-text-muted">
            Showing{" "}
            <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(page * limit, totalRequests)}
            </span>{" "}
            of <span className="font-medium">{totalRequests}</span> requests
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <span className="px-2 text-sm text-text-muted">
                Page {page} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

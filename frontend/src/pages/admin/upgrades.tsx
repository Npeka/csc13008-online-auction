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
import { Modal } from "@/components/ui/modal";
import { usersApi, type UpgradeRequest } from "@/lib";

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export function UpgradeRequests() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<
    "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Reject modal state
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    request: UpgradeRequest | null;
  }>({
    isOpen: false,
    request: null,
  });
  const [rejectReason, setRejectReason] = useState("");

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

  const handleOpenRejectModal = (request: UpgradeRequest) => {
    setRejectModal({ isOpen: true, request });
    setRejectReason("");
  };

  const handleCloseRejectModal = () => {
    setRejectModal({ isOpen: false, request: null });
    setRejectReason("");
  };

  const handleConfirmReject = () => {
    if (!rejectModal.request) return;
    processMutation.mutate({
      id: rejectModal.request.id,
      status: "REJECTED",
      reason: rejectReason || undefined,
    });
    handleCloseRejectModal();
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
      <PageHeader />

      <TabBar
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={(tab) => {
          setSelectedTab(tab);
          setPage(1);
        }}
      />

      <RequestsList
        requests={requests}
        isLoading={isLoading}
        isFetching={isFetching}
        selectedTab={selectedTab}
        onApprove={handleApprove}
        onReject={handleOpenRejectModal}
      />

      {totalPages > 1 && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          limit={limit}
          totalRequests={totalRequests}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      )}

      <RejectModal
        isOpen={rejectModal.isOpen}
        requestName={rejectModal.request?.user?.name || ""}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onClose={handleCloseRejectModal}
        onConfirm={handleConfirmReject}
        isLoading={processMutation.isPending}
      />
    </div>
  );
}

// ============================================================================
// CHILD COMPONENTS (ordered top to bottom as they appear on the page)
// ============================================================================

function PageHeader() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-text">Upgrade Requests</h1>
      <p className="mt-2 text-text-muted">
        Review and manage bidder to seller upgrade requests
      </p>
    </div>
  );
}

function TabBar({
  tabs,
  selectedTab,
  onTabChange,
}: {
  tabs: Array<{ key: "PENDING" | "APPROVED" | "REJECTED"; label: string }>;
  selectedTab: "PENDING" | "APPROVED" | "REJECTED";
  onTabChange: (tab: "PENDING" | "APPROVED" | "REJECTED") => void;
}) {
  return (
    <div className="flex gap-2 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
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
  );
}

function RequestsList({
  requests,
  isLoading,
  isFetching,
  selectedTab,
  onApprove,
  onReject,
}: {
  requests: UpgradeRequest[];
  isLoading: boolean;
  isFetching: boolean;
  selectedTab: "PENDING" | "APPROVED" | "REJECTED";
  onApprove: (request: UpgradeRequest) => void;
  onReject: (request: UpgradeRequest) => void;
}) {
  if (requests.length === 0) {
    return <EmptyState selectedTab={selectedTab} />;
  }

  return (
    <div className="relative space-y-4">
      {isFetching && !isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-card/50 backdrop-blur-[1px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
}

function RequestCard({
  request,
  onApprove,
  onReject,
}: {
  request: UpgradeRequest;
  onApprove: (request: UpgradeRequest) => void;
  onReject: (request: UpgradeRequest) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-text">{request.user?.name}</p>
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
              <Button onClick={() => onApprove(request)} size="sm">
                <Check className="mr-1 h-4 w-4" />
                Approve
              </Button>
              <Button
                onClick={() => onReject(request)}
                variant="outline"
                size="sm"
              >
                <X className="mr-1 h-4 w-4" />
                Reject
              </Button>
            </>
          ) : (
            <Badge
              variant={request.status === "APPROVED" ? "success" : "error"}
            >
              {request.status}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  selectedTab,
}: {
  selectedTab: "PENDING" | "APPROVED" | "REJECTED";
}) {
  return (
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
  );
}

function PaginationControls({
  page,
  totalPages,
  limit,
  totalRequests,
  isLoading,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  limit: number;
  totalRequests: number;
  isLoading: boolean;
  onPageChange: (updater: (prev: number) => number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-4">
      <p className="text-sm text-text-muted">
        Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
        <span className="font-medium">
          {Math.min(page * limit, totalRequests)}
        </span>{" "}
        of <span className="font-medium">{totalRequests}</span> requests
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange((p) => Math.max(1, p - 1))}
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
          onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function RejectModal({
  isOpen,
  requestName,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  requestName: string;
  reason: string;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Upgrade Request"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-text-muted">
          You are about to reject the upgrade request from{" "}
          <span className="font-semibold text-text">{requestName}</span>.
        </p>

        <div>
          <label
            htmlFor="reject-reason"
            className="mb-2 block text-sm font-medium text-text"
          >
            Reason for Rejection (Optional)
          </label>
          <textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Explain why this request is being rejected..."
            className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            rows={4}
          />
          <p className="mt-1 text-xs text-text-muted">
            This message will be visible to the user in their profile.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
          >
            <X className="mr-1 h-4 w-4" />
            Reject Request
          </Button>
        </div>
      </div>
    </Modal>
  );
}

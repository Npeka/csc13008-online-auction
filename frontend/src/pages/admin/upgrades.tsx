import { useState } from "react";
import toast from "react-hot-toast";
import { Calendar, Check, Mail, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UpgradeRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export function UpgradeRequests() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([
    {
      id: "1",
      userId: "user1",
      userName: "Alice Johnson",
      email: "alice@example.com",
      reason: "I want to sell my vintage collectibles",
      status: "PENDING",
      createdAt: "2026-01-01T08:00:00Z",
    },
    {
      id: "2",
      userId: "user2",
      userName: "Bob Smith",
      email: "bob@example.com",
      reason: "Looking to auction my art pieces",
      status: "PENDING",
      createdAt: "2025-12-31T14:30:00Z",
    },
  ]);

  const [selectedTab, setSelectedTab] = useState<
    "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");

  const handleApprove = (request: UpgradeRequest) => {
    // TODO: Call API to approve
    setRequests(
      requests.map((r) =>
        r.id === request.id ? { ...r, status: "APPROVED" as const } : r,
      ),
    );
    toast.success(`Approved ${request.userName}'s upgrade request`);
  };

  const handleReject = (request: UpgradeRequest) => {
    const reason = window.prompt("Reason for rejection (optional):");
    // TODO: Call API to reject with reason
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.log(reason);
    setRequests(
      requests.map((r) =>
        r.id === request.id ? { ...r, status: "REJECTED" as const } : r,
      ),
    );
    toast.success(`Rejected ${request.userName}'s upgrade request`);
  };

  const filteredRequests = requests.filter((r) => r.status === selectedTab);

  const tabs: Array<{ key: typeof selectedTab; label: string; count: number }> =
    [
      {
        key: "PENDING",
        label: "Pending",
        count: requests.filter((r) => r.status === "PENDING").length,
      },
      {
        key: "APPROVED",
        label: "Approved",
        count: requests.filter((r) => r.status === "APPROVED").length,
      },
      {
        key: "REJECTED",
        label: "Rejected",
        count: requests.filter((r) => r.status === "REJECTED").length,
      },
    ];

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
            onClick={() => setSelectedTab(tab.key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
              selectedTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                selectedTab === tab.key
                  ? "bg-primary text-white"
                  : "bg-bg-secondary text-text-muted"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
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
                      {request.userName}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {request.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-bg-secondary p-4">
                  <p className="text-sm font-medium text-text">Reason:</p>
                  <p className="mt-1 text-text-muted">{request.reason}</p>
                </div>
              </div>

              <div className="ml-4 flex items-center gap-2">
                {request.status === "PENDING" ? (
                  <>
                    <Button
                      onClick={() => handleApprove(request)}
                      variant="primary"
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

        {filteredRequests.length === 0 && (
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
    </div>
  );
}

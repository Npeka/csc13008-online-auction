import { useState } from "react";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Search,
  Users,
  Trash2,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { useDebounce } from "@/hooks/use-debounce";
import { usersApi } from "@/lib";
import { cn } from "@/lib/utils";

export function UsersManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "BIDDER",
    address: "",
    phone: "",
    emailVerified: false,
  });

  // Queries
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "users",
      { page, limit, role: roleFilter, search: debouncedSearchQuery },
    ],
    queryFn: () =>
      usersApi.getUsers({
        page,
        limit,
        role: roleFilter || undefined,
        search: debouncedSearchQuery || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const isDebouncing = searchQuery !== debouncedSearchQuery;
  const showSearchLoading =
    isDebouncing || (isFetching && !!debouncedSearchQuery);

  const users = data?.data || [];
  const totalUsers = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
      setDeleteUserId(null);
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleDeleteUser = () => {
    if (!deleteUserId) return;
    deleteMutation.mutate(deleteUserId);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "BIDDER",
      address: "",
      phone: "",
      emailVerified: false,
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="error">Admin</Badge>;
      case "SELLER":
        return <Badge variant="success">Seller</Badge>;
      default:
        return <Badge variant="default">Bidder</Badge>;
    }
  };

  const tabs = [
    { id: "", label: "All Users", icon: Users },
    { id: "BIDDER", label: "Bidders", icon: Shield },
    { id: "SELLER", label: "Sellers", icon: ShieldCheck },
    { id: "ADMIN", label: "Admins", icon: ShieldAlert },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Users Management</h1>
          <p className="mt-2 text-text-muted">
            Manage system users, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          {showSearchLoading ? (
            <Loader2 className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 animate-spin text-primary" />
          ) : (
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-text-muted" />
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search users..."
            className="w-full rounded-xl border border-border bg-bg-card py-2.5 pr-4 pl-10 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
        </div>

        {/* Role Tabs */}
        <div className="flex overflow-x-auto rounded-xl border border-border bg-bg-card p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setRoleFilter(tab.id);
                  setPage(1);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-bg-secondary text-primary"
                    : "text-text-muted hover:bg-bg-secondary hover:text-text",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-bg-card">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-card/50 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <table className="w-full">
          <thead className="border-b border-border bg-bg-tertiary">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap text-text">
                User
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap text-text">
                Role
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold whitespace-nowrap text-text">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap text-text">
                Joined
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold whitespace-nowrap text-text">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-text-muted">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-bg-secondary"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                        <span className="text-sm font-semibold text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-text">{user.name}</p>
                        <p className="flex items-center gap-1 text-sm text-text-muted">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4 text-center">
                    {user.emailVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="default">Pending</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/users/${user.id}`}
                        target="_blank"
                        className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-primary"
                        title="View Profile"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteUserId(user.id)}
                        className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-error"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          {totalUsers > 0 && (
            <p className="text-sm text-text-muted">
              Showing{" "}
              <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(page * limit, totalUsers)}
              </span>{" "}
              of <span className="font-medium">{totalUsers}</span> users
            </p>
          )}
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
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text focus:border-primary focus:outline-none"
            >
              <option value="BIDDER">Bidder</option>
              <option value="SELLER">Seller</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="verified"
              checked={formData.emailVerified}
              onChange={(e) =>
                setFormData({ ...formData, emailVerified: e.target.checked })
              }
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="verified" className="text-sm text-text">
              Email Verified
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

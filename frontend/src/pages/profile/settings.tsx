import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function SettingsPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="container-app py-8 text-center">
        <p className="text-text-muted">Please login to access settings.</p>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <h1 className="mb-8 text-2xl font-bold text-text">Account Settings</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Info */}
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <h2 className="mb-4 font-semibold text-text">Profile Information</h2>
          <form className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={user.fullName}
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Email
              </label>
              <input
                type="email"
                defaultValue={user.email}
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Address
              </label>
              <textarea
                defaultValue={user.address}
                className="w-full resize-none rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
                rows={3}
              />
            </div>
            <Button>Save Changes</Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <h2 className="mb-4 font-semibold text-text">Change Password</h2>
          <form className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
              />
            </div>
            <Button variant="outline">Update Password</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

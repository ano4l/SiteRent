import { AdminShell } from "@/components/admin/admin-shell";
import { isCurrentUserAdmin } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authorized = await isCurrentUserAdmin();

  if (!authorized) {
    return (
      <AdminShell>
        <div className="grid min-h-[70vh] place-items-center px-4">
          <section className="w-full max-w-md rounded-[28px] border border-admin-line bg-white p-8 text-center shadow-[0_20px_60px_rgba(17,17,17,0.08)]">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-admin-surface text-admin-accent">
              SR
            </div>
            <h1 className="mt-5 text-2xl font-black text-ink">Admin access required</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Your account is signed in, but it does not have admin permissions. Ask a SiteRent administrator to grant access before using admin operations.
            </p>
          </section>
        </div>
      </AdminShell>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

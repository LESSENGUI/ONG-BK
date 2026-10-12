import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ClipboardCheck, FileText, Landmark, LayoutDashboard, Settings, ShieldCheck, WalletCards, UsersRound } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";
import { getCurrentUser, userCan } from "@/lib/auth";
import type { PermissionCode } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function SecureAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  const fullName = [user.profile?.firstName, user.profile?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="min-h-screen bg-[#f6f4f1] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col bg-[#123f34] px-5 py-6 text-white lg:min-h-screen">
        <Link className="flex items-center gap-3 px-2" href="/admin/dashboard">
          <span className="grid size-10 place-items-center rounded-xl bg-white/10">
            <ShieldCheck size={20} />
          </span>
          <span>
            <strong className="block text-sm">ONG-BK</strong>
            <span className="text-xs text-white/60">Espace administration</span>
          </span>
        </Link>
        <nav aria-label="Navigation administration" className="mt-9 grid gap-2">
          <Link
            className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold"
            href="/admin/dashboard"
          >
            <LayoutDashboard size={17} /> Tableau de bord
          </Link>
          {([
            "IDENTITY_READ",
            "GOVERNANCE_READ",
            "MEMBERS_READ",
            "MEMBERSHIP_REQUESTS_READ",
            "DOCUMENTS_READ",
            "BE_MEETINGS_READ",
            "CCE_MEETINGS_READ",
          ] satisfies PermissionCode[]).some((permission) => user.permissions.includes(permission)) && (
            <Link
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
              href="/admin/institutionnel"
            >
              <Landmark size={17} /> Vie institutionnelle
            </Link>
          )}
          {(userCan(user, "CONTENT_READ") || userCan(user, "CONTENT_CREATE") || userCan(user, "DOCUMENTS_CREATE")) && (
            <Link
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
              href="/admin/publications"
            >
              <FileText size={17} /> Articles et publications
            </Link>
          )}
          {userCan(user, "AUDIT_READ") && (
            <Link
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
              href="/admin/audit"
            >
              <Activity size={17} /> Journal d’audit
            </Link>
          )}
          {userCan(user, "FINANCE_READ") && (
            <Link
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
              href="/admin/finance"
            >
              <WalletCards size={17} /> Finances et contrôle
            </Link>
          )}
          {userCan(user, "CCE_FINDINGS_READ") && (
            <Link
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
              href="/admin/cce"
            >
              <ClipboardCheck size={17} /> Suivi CCE
            </Link>
          )}
          {user.roleCode === "SYSTEM_ADMIN" && (
            <Link
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
              href="/admin/users"
            >
              <UsersRound size={17} /> Comptes et tâches
            </Link>
          )}
          {userCan(user, "SETTINGS_READ") && (
            <Link
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
              href="/admin/settings"
            >
              <Settings size={17} /> Paramètres système
            </Link>
          )}
        </nav>
        <div className="mt-auto hidden border-t border-white/15 pt-5 lg:block">
          <p className="truncate text-sm font-semibold">{fullName || user.email}</p>
          {fullName && <p className="mt-1 truncate text-xs text-white/60">{user.email}</p>}
          <p className="mb-4 mt-2 text-xs leading-5 text-white/60">{user.roleName}</p>
          <LogoutButton />
        </div>
        <div className="mt-5 lg:hidden">
          <p className="mb-3 truncate text-xs text-white/75">{user.email} · {user.roleName}</p>
          <LogoutButton />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex min-h-[76px] items-center justify-between border-b border-ink/[0.07] bg-white px-5 sm:px-8">
          <p className="text-sm font-semibold text-ink">Administration ONG-BK</p>
          <span className="hidden text-xs text-ink/55 sm:block">Accès protégé et journalisé</span>
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}

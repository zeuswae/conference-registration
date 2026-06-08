"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/events", label: "Events" },
  { href: "/dashboard/certificates", label: "Certificates" },
  { href: "/dashboard/membership", label: "Membership" },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function DashboardNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();

  return (
    <header className="dashboard-topbar">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="dashboard-brand-mark">CR</span>
          <span className="hidden text-sm font-black uppercase tracking-[0.18em] text-slate-800 sm:inline">
            Conference Portal
          </span>
        </Link>

        <nav className="order-3 flex w-full gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white p-1 shadow-sm md:order-none md:w-auto">
          {links.map((link) => {
            const active =
              link.href === "/dashboard"
                ? pathname === link.href
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`dashboard-nav-link whitespace-nowrap ${active ? "dashboard-nav-link-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`dashboard-nav-link whitespace-nowrap ${
                pathname.startsWith("/admin") ? "dashboard-nav-link-active" : ""
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="dashboard-user-chip">
            <span className="dashboard-avatar">{initials(user.name) || "U"}</span>
            <span className="hidden text-sm font-bold text-slate-700 sm:inline">{user.name}</span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded-full px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

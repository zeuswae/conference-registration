"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/events", label: "Events" },
  { href: "/dashboard/tickets", label: "Tickets" },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Shared nav content — used in both desktop sidebar and mobile drawer
  const navContent = (
    // ↓ FIXED: explicit flex-col justify-between so top nav and bottom section
    //   always stack vertically and push to opposite ends regardless of context
    <div className="flex h-full flex-col justify-between">
      {/* Top: brand + links */}
      <div>
        <Link
          href="/dashboard"
          className="mb-8 flex items-center gap-3"
          onClick={() => setSidebarOpen(false)}
        >
          <span className="dashboard-brand-mark">CR</span>
          <span>
            <span className="block text-sm font-black uppercase tracking-[0.18em] text-slate-900">
              Conference
            </span>
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Portal
            </span>
          </span>
        </Link>

        <nav className="space-y-1">
          {links.map((link) => {
            const active =
              link.href === "/dashboard"
                ? pathname === link.href
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`dashboard-side-link ${active ? "dashboard-side-link-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setSidebarOpen(false)}
              className={`dashboard-side-link ${pathname.startsWith("/admin") ? "dashboard-side-link-active" : ""}`}
            >
              Admin
            </Link>
          )}
        </nav>
      </div>

      {/* Bottom: help, profile, logout */}
      <div className="border-t border-slate-200 pt-5">
        <a
          href="/#contact"
          target="_blank"
          rel="noreferrer"
          className="mb-5 flex w-full items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-black text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-100"
        >
          <span aria-hidden="true">?</span>
          Get help
        </a>
        <Link
          href="/dashboard/profile"
          onClick={() => setSidebarOpen(false)}
          className="mb-4 flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50"
        >
          <span className="dashboard-avatar">{initials(user.name) || "U"}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black text-slate-900">{user.name}</span>
            <span className="block truncate text-xs font-semibold text-slate-500">{user.role.toLowerCase()}</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Mobile top bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="dashboard-brand-mark">CR</span>
          <span className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">
            Conference
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="2" y="4"    width="14" height="1.5" rx="0.75" fill="currentColor" />
            <rect x="2" y="8.25" width="14" height="1.5" rx="0.75" fill="currentColor" />
            <rect x="2" y="12.5" width="14" height="1.5" rx="0.75" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* ─── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="dashboard-sidebar hidden lg:flex">
        {navContent}
      </aside>

      {/* ─── Mobile drawer ───────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* ↓ FIXED: added flex-col so the inner div's h-full works correctly */}
          <aside className="dashboard-sidebar absolute inset-y-0 left-0 z-50 flex w-72 flex-col animate-[slideInLeft_0.22s_ease-out]">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            >
              ✕
            </button>
            {navContent}
          </aside>
        </div>
      )}

      {/* ─── Logout confirmation modal ───────────────────────────────── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">

            {/* Light header */}
            <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-5">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-indigo-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-slate-900">Logging out?</p>
                <p className="mt-1 text-xs text-slate-500">You'll be signed out of your account.</p>
              </div>
            </div>

            {/* Signed-in-as row */}
            <div className="my-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <span className="dashboard-avatar shrink-0">{initials(user.name) || "U"}</span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400">Signed in as</p>
                <p className="truncate text-sm font-bold text-slate-800">{user.name}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 active:scale-[0.98]"
                >
                  Log out
                </button>
              </form>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
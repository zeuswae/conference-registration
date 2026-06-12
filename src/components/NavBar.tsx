"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const sections = ["home", "about", "how-it-works", "faqs", "contact"];

const navLinks = [
  { href: "#home", label: "Home", id: "home" },
  { href: "#about", label: "About", id: "about" },
  { href: "#how-it-works", label: "How it works", id: "how-it-works" },
  { href: "#faqs", label: "FAQs", id: "faqs" },
  { href: "#contact", label: "Contact", id: "contact" },
];

interface NavBarProps {
  session: unknown;
  primaryHref: string;
  primaryText: string;
}

export function NavBar({ session, primaryHref, primaryText }: NavBarProps) {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      // Use 1/3 down the viewport as the trigger point
      const trigger = window.scrollY + window.innerHeight / 3;
      let current = "home";

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= trigger) {
          current = id;
        }
      }

      setActive(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // run once on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/30 bg-white/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-3 font-bold text-slate-950">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
            CR
          </span>
          <span className="hidden text-sm uppercase tracking-[0.22em] text-slate-700 sm:inline">
            Conference Portal
          </span>
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 text-sm font-semibold text-slate-600 shadow-sm">
          {navLinks.map(({ href, label, id }) => (
            <a
              key={id}
              href={href}
              className={`nav-pill transition-colors duration-200 ${
                active === id
                  ? "bg-indigo-600 text-white"
                  : ""
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          {!session && (
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-indigo-700"
            >
              Sign in
            </Link>
          )}
          <Link href={primaryHref} className="btn-primary px-5 py-2.5 text-sm">
            {primaryText}
          </Link>
        </div>
      </nav>
    </header>
  );
}
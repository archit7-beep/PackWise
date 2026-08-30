"use client";
import { useRef } from "react";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", current === "dark" ? "light" : "dark");
  };

  return (
    <header
      id="nav"
      ref={navRef}
      className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-full z-50 bg-[#FDFBF7]/12 dark:bg-black/20 backdrop-blur-md backdrop-saturate-[180%] border border-white/35 dark:border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] px-6 py-2.5 flex items-center justify-between transition-all duration-300"
    >
      {/* Brand logo & title */}
      <a className="brand flex items-center gap-2.5 font-bold text-lg tracking-tight" href="/" aria-label="PackWise home">
        <span className="brand-icon w-8 h-8 rounded-lg bg-[var(--orange)] flex items-center justify-center text-white font-black text-sm font-[family-name:var(--display)]">
          PW
        </span>
        <span className="text-[var(--ink)] font-[family-name:var(--display)] font-extrabold text-xl tracking-tight">
          PackWise
        </span>
      </a>

      {/* Navigation links, Mode toggle, and CTA with uniform, even spacing */}
      <div className="flex items-center gap-7">
        <nav className="nav__links hidden md:flex items-center gap-7 text-sm font-medium text-[var(--muted)]" aria-label="Primary">
          <a href="/#overview" className="hover:text-[var(--ink)] transition-colors">Overview</a>
          <a href="/#compliance" className="hover:text-[var(--ink)] transition-colors">Compliance</a>
          <a href="/#nutrition" className="hover:text-[var(--ink)] transition-colors">Nutrition</a>
          <a href="/dashboard" className="hover:text-[var(--ink)] transition-colors font-semibold text-[var(--peri-ink)]">Dashboard</a>
          <a href="/#faq" className="hover:text-[var(--ink)] transition-colors">FAQ</a>
        </nav>

        {/* Theme Toggle — spaced with the exact same gap-7 as the nav links */}
        <button
          className="theme-toggle w-9 h-9 rounded-full border border-[var(--line)] flex items-center justify-center text-sm text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-2)] transition-all cursor-pointer"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          🌙
        </button>

        {/* CTA Button */}
        <a className="btn btn--solid btn--sm whitespace-nowrap" href="/#top" id="nav-cta">
          <span>Start Scanning</span>
        </a>
      </div>
    </header>
  );
}

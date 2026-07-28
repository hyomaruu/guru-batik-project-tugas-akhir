"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/berita", label: "Berita" },
  { href: "/agenda", label: "Agenda" },
  { href: "/galeri", label: "Galeri" },
  { href: "/tentang", label: "Tentang Kami" },
];

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [pathname]);

  const navClasses = clsx(
    "pub-nav",
    !scrolled ? "pub-nav-transparent" : "pub-nav-scrolled"
  );

  return (
    <nav className={navClasses} id="public-navbar">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-18 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group z-10" id="nav-logo">
          <div className="relative w-44 h-14 transition-transform duration-300 group-hover:scale-105">
            <Image 
              src="/logo.png" 
              alt="Guru Batik Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => {
            const active = (l.href === "/" && pathname === "/") || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "pub-nav-link",
                  active ? "text-blue-400" : "text-white/80 hover:text-white"
                )}
                id={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop: Admin link */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/admin/login"
            className={clsx(
              "h-9 px-5 text-sm font-semibold rounded-full border transition-all duration-300 flex items-center gap-2",
              !scrolled
                ? "border-white/30 text-white/80 hover:bg-white/15 hover:border-white/50 hover:text-white"
                : "border-white/20 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/40"
            )}
            id="nav-admin-link"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Admin
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className={clsx(
            "md:hidden relative w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center",
            !scrolled ? "hover:bg-white/10 text-white" : "hover:bg-warm-100 text-batik-text"
          )}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="nav-mobile-toggle"
        >
          <div className="w-5 h-5 relative flex flex-col justify-center gap-1.5">
            <span className={clsx(
              "block h-0.5 rounded-full transition-all duration-300 origin-center",
              menuOpen ? "rotate-45 translate-y-2 bg-batik-primary" : (!scrolled ? "bg-white" : "bg-batik-text")
            )} />
            <span className={clsx(
              "block h-0.5 rounded-full transition-all duration-300",
              menuOpen ? "opacity-0 scale-x-0" : (!scrolled ? "bg-white" : "bg-batik-text")
            )} />
            <span className={clsx(
              "block h-0.5 rounded-full transition-all duration-300 origin-center",
              menuOpen ? "-rotate-45 -translate-y-2 bg-batik-primary" : (!scrolled ? "bg-white" : "bg-batik-text")
            )} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="px-6 py-6 space-y-1 border-t border-batik-border/30">
          {navLinks.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "text-batik-primary bg-batik-primary/8"
                    : "text-batik-muted hover:text-batik-text hover:bg-warm-100"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-batik-primary flex-shrink-0" />
                )}
                {l.label}
              </Link>
            );
          })}
          <div className="pt-4 mt-4 border-t border-batik-border/30">
            <Link
              href="/admin/login"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-batik-muted hover:text-batik-primary hover:bg-warm-100 transition-all duration-200"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Area Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

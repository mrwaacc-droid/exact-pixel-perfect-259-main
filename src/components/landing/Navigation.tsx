import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function Navigation() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const previousBodyOverflowRef = useRef<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
        toggleRef.current?.focus();
      }
    },
    [isMobileOpen],
  );

  useEffect(() => {
    if (!isMobileOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflowRef.current ?? "";
      previousBodyOverflowRef.current = null;
    };
  }, [isMobileOpen, handleKeyDown]);

  const navLinks = [
    { href: "#how-it-works", label: "How it works" },
    { href: "#classroom", label: "Classroom" },
    { href: "#roles", label: "Solutions" },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#institutions", label: "Institutions" },
    { href: "#pricing", label: "Pricing" },
  ];
  const courseLink = { to: "/courses", label: "Courses" };

  return (
    <nav
      className={`cine-nav ${scrolled ? "cine-nav--scrolled" : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between gap-6 px-6">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Klassruum home">
          <Logo size={34} variant="default" />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="cine-nav-link">
              {link.label}
            </a>
          ))}
          <Link to={courseLink.to} className="cine-nav-link">
            {courseLink.label}
          </Link>
        </div>

        <div className="hidden items-center gap-4 shrink-0 md:flex">
          <Link
            to="/auth"
            className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <Link to="/institutions/register" className="cine-nav-cta">
            Request Demo
            <ArrowRight size={13} />
          </Link>
        </div>

        <button
          ref={toggleRef}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="rounded-lg p-2 text-heading transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-menu"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMobileOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="menu"
          className="absolute left-0 right-0 top-[68px] flex flex-col gap-2 border-b border-border bg-white/98 p-6 shadow-lg backdrop-blur-lg md:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg py-2 text-[16px] font-medium text-heading focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {link.label}
            </a>
          ))}
          <Link
            to={courseLink.to}
            role="menuitem"
            onClick={() => setIsMobileOpen(false)}
            className="rounded-lg py-2 text-[16px] font-medium text-heading focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {courseLink.label}
          </Link>
          <hr className="border-border" />
          <Link
            to="/auth"
            role="menuitem"
            onClick={() => setIsMobileOpen(false)}
            className="py-2 text-center text-[15px] font-medium text-heading"
          >
            Sign in
          </Link>
          <Link
            to="/institutions/register"
            role="menuitem"
            onClick={() => setIsMobileOpen(false)}
            className="cine-nav-cta mt-2 w-full justify-center"
          >
            Request Demo
            <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </nav>
  );
}
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { type ReactNode, useState, useRef, useEffect, useCallback } from "react";
import {
  Accessibility,
  ChevronRight,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { useAuthContext } from "@/hooks/useUserRole";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  applyLaunchVisibility,
  isLearnerDashboardRole,
  isTeacherDashboardRole,
} from "@/lib/dashboard-config";
import { NotificationBell } from "@/components/dashboard/shared/NotificationBell";

type Props = {
  config?: import("@/lib/dashboard-config").DashboardConfig;
  activePath?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export function DashboardShell({
  config: configProp,
  activePath: activePathProp,
  title,
  subtitle,
  children,
}: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const configFromHook = useDashboardConfig();
  const shouldUseResolvedConfig =
    !configProp ||
    (configProp.role === "teacher" && isTeacherDashboardRole(configFromHook.role)) ||
    (configProp.role === "learner" && isLearnerDashboardRole(configFromHook.role));
  const config = applyLaunchVisibility(shouldUseResolvedConfig ? configFromHook : configProp);
  const { user } = useAuthContext();
  const location = useLocation();
  const activePath = activePathProp ?? location.pathname;
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const getInitials = useCallback((): string => {
    if (!user?.email) return "U";
    return user.email
      .split("@")[0]
      .split(/[._-]/)
      .map((s) => s[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user?.email]);

  const displayName = user?.email?.split("@")[0] ?? "User";

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

  useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileDropdownOpen]);

  useEffect(() => {
    if (!isProfileDropdownOpen && !isMobileMenuOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProfileDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isProfileDropdownOpen, isMobileMenuOpen]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    let frame = 0;
    const setPointer = (clientX: number, clientY: number) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = shell.getBoundingClientRect();
        shell.style.setProperty("--kr-pointer-x", `${clientX - rect.left}px`);
        shell.style.setProperty("--kr-pointer-y", `${clientY - rect.top}px`);
      });
    };

    const handlePointerMove = (event: PointerEvent) => setPointer(event.clientX, event.clientY);
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      shell.style.setProperty("--kr-scroll-progress", progress.toFixed(4));
    };

    setPointer(window.innerWidth * 0.5, window.innerHeight * 0.35);
    handleScroll();
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className="kr-dashboard-shell relative min-h-screen overflow-hidden text-foreground"
    >
      <div className="kr-pointer-wash" aria-hidden="true" />
      <div className="kr-scroll-meter" aria-hidden="true" />
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={toggleMobileMenu} />
      )}

      {/* Sidebar */}
      <aside
        className={`kr-sidebar fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-5">
          <Link to="/" className="flex items-center">
            <Logo size={34} />
          </Link>
          <button
            className="rounded-lg p-2 transition hover:bg-accent lg:hidden"
            onClick={toggleMobileMenu}
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="border-b border-border px-6 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
            {config.title}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label={`${config.title} navigation`}>
          <div className="space-y-1">
            {config.sidebar.map((item) => {
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${isActive
                      ? "bg-heading text-white shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {!isActive && (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border px-4 py-4">
          {isLearnerDashboardRole(config.role) && (
            <Link
              to="/student/access"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mb-3 block rounded-xl border border-border bg-white p-3.5 transition-all duration-150 hover:border-border hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <Accessibility className="h-4 w-4 text-crimson" />
                <span className="text-xs font-semibold text-crimson">Learning Access</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                Manage captions, focus mode, and more
              </p>
            </Link>
          )}

          <div className="rounded-xl border border-border bg-white p-2">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-heading text-xs font-bold text-white">
                {getInitials()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-heading">{displayName}</p>
                <p className="text-[11px] text-muted-foreground">{config.roleLabel}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-9 w-full justify-start rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="relative z-10 lg:ml-[260px]">
        {/* Header */}
        <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-4 border-b border-border bg-[color:var(--kr-glass)] px-4 py-3 backdrop-blur-md lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="rounded-lg p-2 transition hover:bg-accent lg:hidden"
              onClick={toggleMobileMenu}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-muted-foreground" />
            </button>

            {title ? (
              <div className="min-w-0">
                <h1 className="flex items-center gap-2 truncate text-lg font-bold tracking-tight text-heading">
                  {title}
                </h1>
                {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
              </div>
            ) : (
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={config.searchPlaceholder}
                  className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-heading focus:outline-none focus:ring-2 focus:ring-heading/10"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Live status */}
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1.5 sm:flex">
              <div className="relative flex h-1.5 w-1.5">
                <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <div className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs font-semibold text-emerald-600">Live</span>
            </div>

            {title && (
              <div className="relative hidden w-56 md:block lg:w-64 xl:w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={config.searchPlaceholder}
                  className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-heading focus:outline-none focus:ring-2 focus:ring-heading/10"
                />
              </div>
            )}

            <ThemeToggle />

            <NotificationBell config={config} />
            <button
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground transition-all hover:bg-accent hover:text-foreground lg:flex"
              aria-label="Help"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-heading text-xs font-bold text-white shadow-sm transition-all hover:bg-navy-light"
                aria-label="User profile"
                aria-expanded={isProfileDropdownOpen}
                aria-haspopup="true"
              >
                {getInitials()}
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                  <div className="border-b border-border p-4">
                    <p className="text-sm font-semibold text-heading">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email ?? config.roleLabel}
                    </p>
                  </div>
                  <div className="p-2">
                    {isLearnerDashboardRole(config.role) && (
                      <Link
                        to="/student/access"
                        onClick={toggleProfileDropdown}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Accessibility className="h-4 w-4" />
                        <span>Learning Access</span>
                      </Link>
                    )}
                    <Link
                      to={config.settingsHref}
                      onClick={toggleProfileDropdown}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <Link
                      to={config.settingsHref}
                      onClick={toggleProfileDropdown}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </div>
                  <div className="border-t border-border p-2">
                    <button
                      onClick={() => {
                        signOut();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="kr-dashboard-main mx-auto w-full max-w-[1600px] p-4 lg:p-8 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

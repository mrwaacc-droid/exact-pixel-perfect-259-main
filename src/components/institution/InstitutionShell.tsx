import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";

export function InstitutionShell({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const location = useLocation();
  const config = useDashboardConfig();
  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card/40 p-4 md:flex md:flex-col">
        <Link to="/" className="mb-8 px-2">
          <Logo size={34} />
        </Link>
        <nav className="flex-1 space-y-1">
          {config.sidebar.map((i) => {
            const isActive =
              location.pathname === i.href || location.pathname.startsWith(i.href + "/");
            return (
              <Link
                key={i.href}
                to={i.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
              >
                <i.icon className="h-4 w-4" /> {i.label}
              </Link>
            );
          })}
        </nav>
        <Button variant="ghost" size="sm" className="justify-start" onClick={signOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

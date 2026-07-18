import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw, Compass } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { applyAccessibility, loadAccessibility } from "../lib/accessibility";
import { CookieConsentManager } from "@/components/compliance/CookieConsent";
import { ThemeProvider } from "@/components/theme/ThemeContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--page-background)] px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--crimson-soft)] text-[var(--crimson)] shadow-[var(--shadow-soft)]">
          <Compass className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--crimson)]">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">
          We can't find that page
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-[var(--muted)]">
          The page you were looking for has moved, been renamed, or never existed. The rest of
          Klassruum is still right here.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--crimson)] px-5 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--crimson-hover)]"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
          <Link
            to="/auth"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--hover-bg)]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--page-background)] px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-7 text-center shadow-[var(--shadow-lg)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--error-light)] text-[var(--error)]">
            <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--error)]">
            Something broke
          </p>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--ink)]">
            This page didn't load
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-[var(--muted)]">
            We hit an unexpected error rendering this view. Your data and progress elsewhere are
            safe. You can try again or head back to the home page.
          </p>
          {error?.message ? (
            <pre className="mt-5 max-h-32 overflow-auto rounded-[var(--radius)] border border-[var(--border-soft)] bg-[var(--page-background-alt)] p-3 text-left text-[12px] leading-5 text-[var(--muted)]">
              {error.message}
            </pre>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--crimson)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--crimson-hover)]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
            <a
              href="/"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--hover-bg)]"
            >
              <Home className="h-3.5 w-3.5" />
              Go home
            </a>
          </div>
        </div>
        <p className="mt-4 text-center text-[12px] text-[var(--muted)]">
          If this keeps happening, please share the message above with support.
        </p>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Klassruum — AI Classroom" },
      {
        name: "description",
        content: "The AI classroom that speaks, writes, explains, and adapts.",
      },
      { property: "og:title", content: "Klassruum — AI Classroom" },
      {
        property: "og:description",
        content: "The AI classroom that speaks, writes, explains, and adapts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Klassruum — AI Classroom" },
      {
        name: "twitter:description",
        content: "The AI classroom that speaks, writes, explains, and adapts.",
      },
      { name: "theme-color", content: "#7B1E2B" },
      { name: "msapplication-TileColor", content: "#7B1E2B" },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/28e7a790-c7d2-40d0-acc8-2f7b0c2cea9f/id-preview-996de8ca--662c796f-5e08-42d5-8c37-7cfa1b90b661.lovable.app-1780921067978.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/28e7a790-c7d2-40d0-acc8-2f7b0c2cea9f/id-preview-996de8ca--662c796f-5e08-42d5-8c37-7cfa1b90b661.lovable.app-1780921067978.png",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48x48.png" },
      { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/android-chrome-192x192.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "apple-touch-icon-precomposed", href: "/apple-touch-icon-precomposed.png" },
      { rel: "mask-icon", href: "/favicon.svg", color: "#7B1E2B" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&family=Atkinson+Hyperlegible:wght@400;700&family=Patrick+Hand&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-[var(--radius)] focus:bg-[var(--crimson)] focus:px-4 focus:py-2 focus:text-white focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Apply saved accessibility preferences (text scale, contrast, motion) on load.
  useEffect(() => {
    applyAccessibility(loadAccessibility());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <CookieConsentManager />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

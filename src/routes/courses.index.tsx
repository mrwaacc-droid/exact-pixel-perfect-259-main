import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Lock, Sparkles } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Logo } from "@/components/brand/Logo";
import { createSeoHead } from "@/lib/seo";
import { getPurchasableCourses } from "@/lib/course-billing.functions";
import { formatCoursePrice, isFreeCourse } from "@/lib/course-pricing";
import { useClientSession } from "@/hooks/useClientSession";

export const Route = createFileRoute("/courses/")({
  head: () =>
    createSeoHead({
      title: "Courses — Klassruum",
      description: "Browse AI teacher-led courses on Klassruum.",
      path: "/courses",
    }),
  component: CourseCatalogPage,
});

function CourseCatalogPage() {
  const fn = useServerFn(getPurchasableCourses);
  const q = useQuery({ queryKey: ["purchasable-courses"], queryFn: () => fn() });
  const courses = q.data?.courses ?? [];
  const { isSignedIn } = useClientSession();

  return (
    <div className="min-h-screen bg-white text-heading">
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-5 sm:px-8">
          <Link to="/">
            <Logo size={34} />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/pricing" className="rounded-md px-4 py-2 text-sm font-medium text-body hover:text-heading">
              Pricing
            </Link>
            <Link
              to={isSignedIn ? "/student/courses" : "/auth"}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#221B1C] bg-[#221B1C] px-5 py-2 text-sm font-bold !text-white hover:bg-[#1A1415]"
            >
              {isSignedIn ? "Go to dashboard" : "Sign in"}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">Courses</h1>
        <p className="mt-3 max-w-2xl text-base text-body">
          AI teacher-led courses you can start today. Free courses unlock instantly; paid courses are
          a one-time purchase with lifetime access.
        </p>

        {q.isLoading ? (
          <p className="mt-10 text-body">Loading courses…</p>
        ) : courses.length === 0 ? (
          <div className="mt-10 rounded-lg border border-border bg-page-background-alt p-10 text-center">
            <h2 className="text-lg font-bold text-heading">No courses available yet</h2>
            <p className="mt-2 text-sm text-body">Check back soon.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Link key={c.id} to="/courses/$slug" params={{ slug: c.slug }}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#221B1C]/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {c.sourceType === "kingpin" ? "KingPin" : c.institutionName ?? "Course"}
                    </span>
                    <span className="text-base font-extrabold text-heading">
                      {formatCoursePrice(c.priceUsd, c.pricingLabel)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  {c.description && (
                    <p className="line-clamp-2 flex-1 text-sm text-body">{c.description}</p>
                  )}
                  <span
                    className={`inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                      isFreeCourse(c.priceUsd)
                        ? "bg-success-light text-success-dark"
                        : "bg-crimson-soft text-crimson-dark"
                    }`}
                  >
                    <Lock className="h-3 w-3" />
                    {isFreeCourse(c.priceUsd) ? "Enroll free" : "Enroll for access"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-14 flex items-center gap-2 rounded-lg border border-border bg-page-background-alt p-5 text-sm text-body">
          <Sparkles className="h-4 w-4 shrink-0 text-crimson" />
          Looking for an institution plan instead of a single course? See{" "}
          <Link to="/pricing" className="font-semibold underline">
            institution pricing
          </Link>
          .
        </div>
      </main>

      <Footer />
    </div>
  );
}

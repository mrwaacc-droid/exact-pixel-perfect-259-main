import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Clock } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Logo } from "@/components/brand/Logo";
import { CTAButton } from "@/components/landing/primitives";
import { createSeoHead } from "@/lib/seo";
import { getCourseForPurchase } from "@/lib/course-billing.functions";
import { formatCoursePrice, isFreeCourse } from "@/lib/course-pricing";

export const Route = createFileRoute("/courses/$slug")({
  head: ({ params }) =>
    createSeoHead({
      title: "Course — Klassruum",
      description: "Enroll in an AI teacher-led course on Klassruum.",
      path: `/courses/${params.slug}`,
    }),
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { slug } = Route.useParams();
  const fn = useServerFn(getCourseForPurchase);
  const q = useQuery({ queryKey: ["course-for-purchase", slug], queryFn: () => fn({ data: { slug } }) });
  const course = q.data?.course ?? null;

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
              to="/auth"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#221B1C] bg-[#221B1C] px-5 py-2 text-sm font-bold !text-white hover:bg-[#1A1415]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8">
        {q.isLoading ? (
          <p className="text-body">Loading course…</p>
        ) : !course ? (
          <div className="rounded-lg border border-border bg-page-background-alt p-10 text-center">
            <h1 className="text-xl font-bold text-heading">Course not found</h1>
            <p className="mt-2 text-sm text-body">
              This course may have been removed or is no longer available.
            </p>
            <CTAButton to="/pricing" variant="secondary" className="mt-6">
              Browse courses
            </CTAButton>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted">
                <Sparkles className="h-3.5 w-3.5" />
                {course.sourceType === "kingpin" ? "KingPin Course" : "Course"}
              </div>
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
                {course.title}
              </h1>
              {course.institutionName && (
                <p className="mt-2 text-sm font-semibold text-muted">{course.institutionName}</p>
              )}
              {course.description && (
                <p className="mt-5 text-base leading-relaxed text-body">{course.description}</p>
              )}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "AI teacher-led lessons",
                  "Captions & transcripts",
                  "Accessibility modes",
                  "Progress tracking",
                  "Notes & resources",
                  "Certificate of completion",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-body">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#221B1C]" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase card */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-heading">
                    {formatCoursePrice(course.priceUsd, course.pricingLabel)}
                  </span>
                  {course.compareAtPriceUsd ? (
                    <span className="text-sm font-semibold text-gray-400 line-through">
                      ${course.compareAtPriceUsd.toFixed(2)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {isFreeCourse(course.priceUsd) ? "Free access" : "One-time payment · USD"}
                </p>

                <CTAButton
                  to={`/courses/${course.slug}/checkout`}
                  variant="primary"
                  size="lg"
                  className="mt-6 w-full justify-center"
                  showArrow
                >
                  {isFreeCourse(course.priceUsd) ? "Enroll free" : `Enroll for ${formatCoursePrice(course.priceUsd)}`}
                </CTAButton>

                <ul className="mt-6 space-y-2 text-xs text-gray-500">
                  <li className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> Self-paced, start anytime
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout via Paystack
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

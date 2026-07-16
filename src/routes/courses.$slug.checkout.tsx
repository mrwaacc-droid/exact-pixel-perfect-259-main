import { createFileRoute, Link, redirect, useSearch } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Logo } from "@/components/brand/Logo";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { getCourseForPurchase, initializeCourseCheckout, verifyCoursePayment } from "@/lib/course-billing.functions";
import { formatCoursePrice, isFreeCourse } from "@/lib/course-pricing";

export const Route = createFileRoute("/courses/$slug/checkout")({
  beforeLoad: async () => {
    if (!isSupabaseConfigured()) return {};
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return {};
  },
  component: CheckoutPage,
});

function CheckoutPage() {
  const { slug } = Route.useParams();
  const search = useSearch({ from: "/courses/$slug/checkout" }) as { reference?: string };
  const callbackReference = search.reference;

  const courseFn = useServerFn(getCourseForPurchase);
  const initFn = useServerFn(initializeCourseCheckout);
  const verifyFn = useServerFn(verifyCoursePayment);

  const courseQ = useQuery({ queryKey: ["course-for-purchase", slug], queryFn: () => courseFn({ data: { slug } }) });
  const course = courseQ.data?.course ?? null;

  const [verified, setVerified] = useState<"success" | "failed" | null>(null);

  const verifyMutation = useMutation({
    mutationFn: (reference: string) => verifyFn({ data: { reference } }),
    onSuccess: (res: any) => setVerified(res.status === "success" ? "success" : "failed"),
    onError: () => setVerified("failed"),
  });

  useEffect(() => {
    if (callbackReference) verifyMutation.mutate(callbackReference);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callbackReference]);

  const initMutation = useMutation({
    mutationFn: (courseId: string) => initFn({ data: { courseId } }),
    onSuccess: (res: any) => {
      if (res.free) {
        window.location.href = "/student/courses";
      } else if (res.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      }
    },
  });

  const pay = () => {
    if (course) initMutation.mutate(course.id);
  };

  return (
    <div className="min-h-screen bg-page-background-alt text-heading">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-[900px] items-center px-5 sm:px-8">
          <Link to="/">
            <Logo size={34} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-5 py-14 sm:px-8">
        {courseQ.isLoading ? (
          <p className="text-body">Loading…</p>
        ) : !course ? (
          <div className="rounded-lg border border-border bg-white p-10 text-center">
            <h1 className="text-xl font-bold">Course not found</h1>
            <Link to="/pricing" className="mt-4 inline-block text-sm font-semibold text-[var(--crimson)]">
              Browse courses
            </Link>
          </div>
        ) : callbackReference && verifyMutation.isPending ? (
          <div className="rounded-lg border border-border bg-white p-10 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--crimson)]" />
            <h1 className="mt-4 text-xl font-bold">Confirming your payment…</h1>
            <p className="mt-2 text-sm text-body">We're verifying your enrollment with Paystack.</p>
          </div>
        ) : verified === "success" ? (
          <div className="rounded-lg border border-emerald-200 bg-white p-10 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h1 className="mt-4 text-2xl font-extrabold">You're enrolled!</h1>
            <p className="mt-2 text-sm text-body">
              Payment confirmed. You now have full access to <strong>{course.title}</strong>.
            </p>
            <Link
              to="/student/courses"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#221B1C] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1A1415]"
            >
              Go to My Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : verified === "failed" ? (
          <div className="rounded-lg border border-amber-200 bg-white p-10 text-center">
            <h1 className="text-xl font-bold">Payment couldn't be confirmed</h1>
            <p className="mt-2 text-sm text-body">
              If you were charged, your enrollment will complete once the payment settles. Try again or
              contact support.
            </p>
            <button
              onClick={pay}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-[var(--crimson)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--crimson-dark)]"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-extrabold tracking-tight">{course.title}</h1>
            {course.institutionName && (
              <p className="mt-1 text-sm text-muted">{course.institutionName}</p>
            )}
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold">
                {formatCoursePrice(course.priceUsd, course.pricingLabel)}
              </span>
              <span className="text-sm font-semibold text-gray-400">USD · one-time</span>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-body">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#221B1C]" /> Full AI teacher-led lessons
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#221B1C]" /> Lifetime access
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#221B1C]" /> Secure checkout via Paystack
              </li>
            </ul>

            <button
              onClick={pay}
              disabled={initMutation.isPending}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--crimson)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--crimson-dark)] disabled:opacity-60"
            >
              {initMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Starting…
                </>
              ) : isFreeCourse(course.priceUsd) ? (
                "Enroll free"
              ) : (
                <>Pay {formatCoursePrice(course.priceUsd)} with Paystack</>
              )}
            </button>
            {initMutation.isError && (
              <p className="mt-3 text-center text-xs text-red-600">
                {(initMutation.error as Error)?.message || "Could not start checkout. Check that USD payments are enabled."}
              </p>
            )}
            <p className="mt-4 text-center text-[11px] text-gray-400">
              By enrolling you agree to Klassruum's terms. Instant access after payment.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

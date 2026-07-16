import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  ClipboardCheck,
  Globe2,
  Layers3,
  LockKeyhole,
  MapPinned,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { AuthBrandRail } from "@/components/auth/AuthBrandRail";
import { Logo } from "@/components/brand/Logo";
import { registerInstitution } from "@/lib/institutions-register.functions";
import { rememberPendingVerification } from "@/lib/auth-verification";

const SITE_URL = "https://klassruum.com";
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export const Route = createFileRoute("/institutions/register")({
  head: () => ({
    meta: [
      { title: "Register Your Institution - Klassruum AI Virtual Classrooms" },
      {
        name: "description",
        content:
          "Register your school, university, tutoring center, or training provider on Klassruum. Create governed AI classrooms with accessibility, reporting, and institution control.",
      },
      {
        name: "keywords",
        content:
          "register school, register institution, AI classroom setup, virtual classroom for schools, Klassruum registration",
      },
      { name: "author", content: "Klassruum" },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Register Your Institution - Klassruum" },
      {
        property: "og:description",
        content: "Create governed AI-powered classrooms for your institution.",
      },
      { property: "og:url", content: `${SITE_URL}/institutions/register` },
      { property: "og:image", content: "/images/scenes/scene-1.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/institutions/register` }],
    script: [
      ...(TURNSTILE_SITE_KEY
        ? [
            {
              src: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
              async: true,
              defer: true,
            },
          ]
        : []),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Register Your Institution on Klassruum",
          url: `${SITE_URL}/institutions/register`,
          description:
            "Register your school, university, tutoring center, or training provider on Klassruum to create governed AI classrooms.",
        }),
      },
    ],
  }),
  component: RegisterPage,
});

const INSTITUTION_TYPES = [
  ["school", "School"],
  ["university", "University"],
  ["college", "College"],
  ["tuition_center", "Tuition center"],
  ["online_tutor", "Online tutor"],
  ["ngo", "NGO"],
  ["company_training", "Company training"],
  ["religious_institution", "Religious institution"],
  ["government_program", "Government program"],
  ["other", "Other"],
] as const;

const USE_CASES = [
  ["ai_classroom", "AI classroom"],
  ["human_teacher_classroom", "Human teacher classroom"],
  ["hybrid_classroom", "Hybrid classroom"],
  ["training_program", "Training program"],
  ["exam_preparation", "Exam preparation"],
  ["accessibility_focused", "Accessibility-focused learning"],
] as const;

const BENEFITS = [
  {
    icon: <BookOpenCheck size={18} />,
    title: "Approved materials become teachable lessons",
    body: "Upload your curriculum and turn it into structured sessions with board work, checks, notes, and transcripts.",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Governance starts on day one",
    body: "Institution-owned data, role-aware access, accessibility defaults, and reporting are treated as core setup.",
  },
  {
    icon: <Globe2 size={18} />,
    title: "Works across real deployment conditions",
    body: "Browser delivery keeps rollout practical across schools, training teams, NGOs, and distributed campuses.",
  },
];

const PROCESS = [
  "Create the institution workspace",
  "Add admins, teachers, courses, and learners",
  "Load materials and accessibility preferences",
  "Launch reviewed AI teaching sessions",
];

const TRUST_POINTS = [
  "GDPR-aligned workflows",
  "WCAG-minded classroom controls",
  "Institution reporting built in",
];

const FIELD_CLASS =
  "h-11 w-full border border-gray-200 bg-white px-3.5 text-sm font-medium text-[#221B1C] outline-none transition-colors placeholder:text-gray-400 focus:border-[var(--crimson)] focus:ring-4 focus:ring-[#8B2E3D]/10";

const LABEL_CLASS = "block text-xs font-bold uppercase tracking-[0.12em] text-gray-500";

function RegisterPage() {
  const navigate = useNavigate();
  const fn = useServerFn(registerInstitution);
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");

  const [form, setForm] = useState({
    institution_name: "",
    type: "school" as (typeof INSTITUTION_TYPES)[number][0],
    country: "",
    city: "",
    admin_full_name: "",
    admin_email: "",
    phone: "",
    password: "",
    website: "",
    learner_count: "",
    preferred_use_case: "ai_classroom" as (typeof USE_CASES)[number][0],
  });

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current || turnstileWidgetId.current) return;

    let cancelled = false;
    const renderWidget = () => {
      if (cancelled || !window.turnstile || !turnstileRef.current || turnstileWidgetId.current) {
        return;
      }

      turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: setCaptchaToken,
        "expired-callback": () => setCaptchaToken(""),
        "error-callback": () => setCaptchaToken(""),
      });
    };

    const timer = window.setInterval(() => {
      if (window.turnstile) {
        window.clearInterval(timer);
        renderWidget();
      }
    }, 100);

    renderWidget();
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const mut = useMutation({
    mutationFn: async () => {
      const result = await fn({
        data: {
          institution_name: form.institution_name,
          type: form.type,
          country: form.country,
          city: form.city,
          admin_full_name: form.admin_full_name,
          admin_email: form.admin_email,
          phone: form.phone,
          password: form.password,
          captchaToken,
          website: form.website,
          learner_count: form.learner_count ? Number(form.learner_count) : undefined,
          preferred_use_case: form.preferred_use_case,
        },
      });
      return result;
    },
    onSuccess: () => {
      rememberPendingVerification(form.admin_email);
      toast.success("Check your email to verify your account");
      navigate({ to: "/auth/verify-email" });
    },
    onError: (e: Error) => {
      setCaptchaToken("");
      window.turnstile?.reset(turnstileWidgetId.current ?? undefined);
      toast.error(e.message);
    },
  });

  return (
    <div className="institution-register-page auth-tech-page grid min-h-screen text-[#221B1C] lg:grid-cols-[minmax(420px,0.82fr)_minmax(0,1.18fr)]">
      <AuthBrandRail
        variant="institution"
        eyebrow="Institution deployment"
        title="Register the workspace that will run your AI classrooms."
        body="Set up an institution environment for reviewed materials, teacher-led sessions, learner access, accessibility preferences, and reporting."
        benefits={BENEFITS}
        stats={[
          { label: "Setup", value: "30 min" },
          { label: "Roles", value: "Admin first" },
          { label: "Launch", value: "Guided" },
        ]}
        proofPoints={TRUST_POINTS}
      />

      <main className="flex min-h-screen items-start justify-center overflow-y-auto p-5 sm:p-8 lg:p-10">
        <section className="institution-register-form auth-tech-panel w-full max-w-[820px] p-5 sm:p-8">
          <Link to="/" className="mb-8 flex items-center lg:hidden" aria-label="Klassruum home">
            <Logo size={34} />
          </Link>

          <div>
            <div className="grid gap-6 border-b border-gray-200 pb-7 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
                  <Building2 size={13} className="text-[var(--crimson)]" />
                  Workspace details
                </p>
                <h2 className="ir-form-title mt-4 font-headings text-[#221B1C]">
                  Tell us how your institution will use Klassruum.
                </h2>
                <p className="ir-form-copy mt-3 max-w-2xl text-gray-600">
                  This creates the first admin account and gives your team a governed place to add
                  courses, learners, teachers, materials, and classroom defaults.
                </p>
              </div>

              <div className="border border-gray-200 bg-[#FBF8F5] p-4">
                <p className="ir-stat-label font-bold uppercase text-gray-500">Rollout path</p>
                <ol className="mt-3 grid gap-2">
                  {PROCESS.map((item, index) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs font-semibold text-gray-700"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[#221B1C] text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <form
              className="mt-8 grid gap-7"
              onSubmit={(e) => {
                e.preventDefault();
                mut.mutate();
              }}
            >
              <section className="border border-gray-200 bg-white">
                <div className="flex items-center gap-3 border-b border-gray-200 bg-[#FBF8F5] px-5 py-4">
                  <div className="flex h-9 w-9 items-center justify-center bg-[var(--beige-soft)] text-[var(--crimson)]">
                    <Layers3 size={17} />
                  </div>
                  <div>
                    <h3 className="ir-section-title text-[#221B1C]">Institution profile</h3>
                    <p className="ir-section-copy text-gray-500">
                      The workspace, scale, and location.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="hidden"
                    aria-hidden="true"
                  />

                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="iname" className={LABEL_CLASS}>
                      Institution name *
                    </label>
                    <input
                      id="iname"
                      required
                      maxLength={200}
                      value={form.institution_name}
                      onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
                      className={FIELD_CLASS}
                      placeholder="e.g. Greenwood Academy"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="itype" className={LABEL_CLASS}>
                      Institution type *
                    </label>
                    <select
                      id="itype"
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value as typeof form.type })
                      }
                      className={FIELD_CLASS}
                    >
                      {INSTITUTION_TYPES.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ilearners" className={LABEL_CLASS}>
                      Number of learners
                    </label>
                    <input
                      id="ilearners"
                      type="number"
                      min={0}
                      value={form.learner_count}
                      onChange={(e) => setForm({ ...form, learner_count: e.target.value })}
                      className={FIELD_CLASS}
                      placeholder="e.g. 500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="icountry" className={LABEL_CLASS}>
                      Country *
                    </label>
                    <div className="relative">
                      <MapPinned
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        id="icountry"
                        required
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        className={`${FIELD_CLASS} pl-10`}
                        placeholder="Country"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="icity" className={LABEL_CLASS}>
                      City *
                    </label>
                    <input
                      id="icity"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className={FIELD_CLASS}
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="iusecase" className={LABEL_CLASS}>
                      Preferred use case
                    </label>
                    <select
                      id="iusecase"
                      value={form.preferred_use_case}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          preferred_use_case: e.target.value as typeof form.preferred_use_case,
                        })
                      }
                      className={FIELD_CLASS}
                    >
                      {USE_CASES.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="border border-gray-200 bg-white">
                <div className="flex items-center gap-3 border-b border-gray-200 bg-[#FBF8F5] px-5 py-4">
                  <div className="flex h-9 w-9 items-center justify-center bg-[var(--beige-soft)] text-[var(--crimson)]">
                    <UsersRound size={17} />
                  </div>
                  <div>
                    <h3 className="ir-section-title text-[#221B1C]">First admin</h3>
                    <p className="ir-section-copy text-gray-500">
                      The person who will own setup and invite the team.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="aname" className={LABEL_CLASS}>
                      Full name *
                    </label>
                    <input
                      id="aname"
                      required
                      value={form.admin_full_name}
                      onChange={(e) => setForm({ ...form, admin_full_name: e.target.value })}
                      className={FIELD_CLASS}
                      placeholder="Admin name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="aemail" className={LABEL_CLASS}>
                      Email *
                    </label>
                    <input
                      id="aemail"
                      type="email"
                      required
                      value={form.admin_email}
                      onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                      className={FIELD_CLASS}
                      placeholder="admin@institution.edu"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="aphone" className={LABEL_CLASS}>
                      Phone *
                    </label>
                    <input
                      id="aphone"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={FIELD_CLASS}
                      placeholder="+1 555 0123"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="apass" className={LABEL_CLASS}>
                      Password *
                    </label>
                    <div className="relative">
                      <LockKeyhole
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        id="apass"
                        type="password"
                        required
                        minLength={8}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className={`${FIELD_CLASS} pl-10`}
                        placeholder="At least 8 characters"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid gap-4 border border-gray-200 bg-[#FBF8F5] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex items-start gap-3 text-sm leading-6 text-gray-600">
                  <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--crimson)]" />
                  <p className="ir-note-copy">
                    After registration, verify your email before configuring courses, resources,
                    accessibility defaults, and team invitations from the institution dashboard.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {TURNSTILE_SITE_KEY && (
                    <div className="min-h-[65px]">
                      <div ref={turnstileRef} />
                    </div>
                  )}
                  <Link
                    to="/"
                    className="inline-flex h-11 items-center justify-center border border-gray-300 bg-white px-5 text-sm font-bold text-gray-700 transition-colors hover:border-gray-400 hover:text-[#221B1C]"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={mut.isPending || Boolean(TURNSTILE_SITE_KEY && !captchaToken)}
                    className="inline-flex h-11 items-center justify-center gap-2 border border-[#221B1C] bg-[#221B1C] px-5 text-sm font-bold text-white shadow-[0_16px_34px_rgba(34,27,28,0.18)] transition-colors hover:bg-[#1A1415] focus:outline-none focus:ring-4 focus:ring-[#8B2E3D]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {mut.isPending ? "Creating..." : "Create and verify"}
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-5 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck size={15} className="text-[var(--crimson)]" />
                Institution setup can be refined after account creation.
              </span>
              <span>
                Already registered?{" "}
                <Link to="/auth" className="font-bold text-[#221B1C] hover:text-[var(--crimson)]">
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

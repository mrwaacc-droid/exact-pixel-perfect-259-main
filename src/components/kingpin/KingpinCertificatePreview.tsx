import { Award, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KingpinCourse } from "@/lib/kingpin-catalog";

export function KingpinCertificatePreview({
  course,
  learnerName = "Learner Name",
  certificateNumber = "KP-2026-AI-0001",
  issueDate = "15 June 2026",
}: {
  course: KingpinCourse;
  learnerName?: string;
  certificateNumber?: string;
  issueDate?: string;
}) {
  const theme = course.certificateTheme;

  return (
    <Card className="overflow-hidden border-[#DDE7F0] bg-white shadow-[0_20px_70px_rgba(25, 19, 20,0.08)]">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-[20px] bg-[var(--page-background)]">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${theme.backgroundColor} 0%, #ffffff 45%, ${theme.backgroundColor} 100%)`,
            }}
          />
          <div
            className="absolute inset-x-0 top-0 h-3"
            style={{
              background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})`,
            }}
          />
          <div
            className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-10"
            style={{ background: theme.accentColor }}
          />
          <div
            className="absolute -left-16 bottom-0 h-40 w-40 rounded-full opacity-10"
            style={{ background: theme.primaryColor }}
          />

          <div className="relative p-8 md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <Badge className="bg-black text-white hover:bg-black">{theme.brandName}</Badge>
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-[#191314] md:text-4xl">
                    Certificate of Completion
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">{theme.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 px-4 py-3">
                <div
                  className="rounded-2xl p-3 text-white"
                  style={{ background: theme.primaryColor }}
                >
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A7478]">
                    Certificate no.
                  </p>
                  <p className="text-sm font-bold text-[#191314]">{certificateNumber}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-[28px] border border-black/10 bg-white/80 p-8 text-center shadow-[0_12px_40px_rgba(25, 19, 20,0.06)]">
              <p className="text-sm uppercase tracking-[0.2em] text-[#8A7478]">
                This certifies that
              </p>
              <h3 className="mt-4 text-4xl font-extrabold tracking-tight text-[#191314] md:text-5xl">
                {learnerName}
              </h3>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#3D3233]">
                has successfully completed the KingPin premium course
              </p>
              <h4 className="mx-auto mt-3 max-w-4xl text-2xl font-bold text-[#191314] md:text-3xl">
                {course.title}
              </h4>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                {course.subtitle}
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <InfoPill
                icon={<Sparkles className="h-4 w-4" />}
                label="Course value"
                value={course.pricingLabel}
              />
              <InfoPill
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Issued by"
                value={theme.brandName}
              />
              <InfoPill icon={<Award className="h-4 w-4" />} label="Issue date" value={issueDate} />
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-end">
              <div className="rounded-2xl border border-black/10 bg-white/70 p-5 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A7478]">
                  Verification
                </p>
                <p className="mt-2 text-sm leading-7 text-[#3D3233]">
                  Verify at <span className="font-semibold text-[#191314]">{theme.website}</span>{" "}
                  using the certificate number and course record.
                </p>
              </div>

              <div className="mx-auto hidden h-24 w-px bg-gradient-to-b from-transparent via-black/10 to-transparent md:block" />

              <div className="rounded-2xl border border-black/10 bg-white/70 p-5 text-left md:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A7478]">
                  Authorized signature
                </p>
                <div className="mt-4 h-px bg-black/20" />
                <p className="mt-3 text-sm font-bold text-[#191314]">{theme.signatureLabel}</p>
                <p className="mt-1 text-xs text-[#8A7478]">{theme.sealText}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 px-4 py-4">
      <div className="rounded-xl bg-black p-2 text-white">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A7478]">{label}</p>
        <p className="mt-1 text-sm font-bold text-[#191314]">{value}</p>
      </div>
    </div>
  );
}

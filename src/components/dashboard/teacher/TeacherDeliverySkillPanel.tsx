import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, CircleAlert, GraduationCap, Repeat2 } from "lucide-react";
import {
  buildLessonDeliverySkillPlan,
  type LessonDeliverySkillInput,
  type LessonDeliverySkillStep,
} from "@/lib/lesson-delivery-skill";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";

function skillVariant(status: LessonDeliverySkillStep["status"]) {
  if (status === "ready") return "success" as const;
  if (status === "needs_attention") return "warning" as const;
  return "neutral" as const;
}

function SkillIcon({ status }: { status: LessonDeliverySkillStep["status"] }) {
  if (status === "ready") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (status === "needs_attention") return <CircleAlert className="h-4 w-4 text-amber-600" />;
  return <Repeat2 className="h-4 w-4 text-muted" />;
}

export function TeacherDeliverySkillPanel({ input }: { input: LessonDeliverySkillInput }) {
  const plan = buildLessonDeliverySkillPlan(input);

  return (
    <section className="dashboard-card kr-reveal p-5 sm:p-6" aria-label="Lesson delivery skill">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="kr-section-kicker">Teaching skill</p>
          <h2 className="text-xl font-extrabold text-heading">Lesson Delivery Skill</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            A practical teaching workflow for running a lesson: frame it, teach from the board,
            check understanding, intervene early, and close with evidence.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-page-background p-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <GraduationCap className="h-4 w-4 text-crimson" />
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
              Readiness
            </span>
          </div>
          <p className="mt-1 text-3xl font-extrabold text-heading">{plan.readinessScore}%</p>
          <p className="text-xs font-bold text-crimson">{plan.statusLabel}</p>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-crimson/15 bg-crimson-soft p-4">
        <p className="text-sm font-bold text-heading">{plan.summary}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {plan.steps.map((step) => (
          <Link
            key={step.id}
            to={step.href}
            className="group flex min-h-[250px] flex-col rounded-2xl border border-border bg-white p-4 transition hover:border-crimson/30 hover:shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <SkillIcon status={step.status} />
              <StatusBadge variant={skillVariant(step.status)}>
                {step.status.replace(/_/g, " ")}
              </StatusBadge>
            </div>
            <h3 className="text-base font-extrabold text-heading">{step.title}</h3>
            <p className="mt-2 text-xs leading-5 text-muted">{step.purpose}</p>
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                Teacher action
              </p>
              <p className="mt-1 text-xs leading-5 text-heading">{step.teacherAction}</p>
            </div>
            <div className="mt-auto pt-4">
              <p className="text-xs font-semibold text-muted">{step.classroomSignal}</p>
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-crimson">
                Open workflow
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

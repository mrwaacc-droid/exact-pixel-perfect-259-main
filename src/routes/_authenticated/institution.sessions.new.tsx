import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Calendar,
  Clock,
  Monitor,
  Users,
  WandSparkles,
} from "lucide-react";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMyInstitutions } from "@/lib/institutions.functions";
import { scheduleInstitutionSession } from "@/lib/calendar.functions";
import { requireInstitutionAdmin } from "@/lib/route-guards";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/institution/sessions/new")({
  beforeLoad: (ctx) => requireInstitutionAdmin(ctx.context),
  component: NewSessionPage,
});

const MODES = [
  { value: "ai_teacher" as const, label: "AI Teacher", icon: <WandSparkles className="h-4 w-4" />, desc: "AI delivers the lesson autonomously to all learners." },
  { value: "human_teacher" as const, label: "Human Teacher", icon: <Users className="h-4 w-4" />, desc: "A live teacher presents the lesson with learner interaction." },
  { value: "hybrid" as const, label: "Hybrid", icon: <Monitor className="h-4 w-4" />, desc: "AI leads with a teacher supervising and stepping in." },
];

function NewSessionPage() {
  const router = useRouter();
  const myFn = useServerFn(getMyInstitutions);
  const my = useQuery({ queryKey: ["my-institutions"], queryFn: () => myFn() });
  const institutionId = my.data?.memberships?.[0]?.institution?.id ?? "";

  const scheduleFn = useServerFn(scheduleInstitutionSession);
  const mutation = useMutation({
    mutationFn: (params: any) => scheduleFn({ data: params }),
    onSuccess: () => {
      toast.success("Session scheduled successfully!");
      void router.navigate({ to: "/institution/sessions" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    course_id: "",
    lesson_id: "",
    starts_at: "",
    ends_at: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    mode: "ai_teacher" as "ai_teacher" | "human_teacher" | "hybrid",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) return;
    mutation.mutate({
      institution_id: institutionId,
      course_id: form.course_id,
      lesson_id: form.lesson_id,
      title: form.title,
      description: form.description || undefined,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : undefined,
      timezone: form.timezone,
      mode: form.mode,
    });
  };

  return (
    <InstitutionShell title="Schedule New Session">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#132033]">Session title</label>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Quadratic Equations — Form 2"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#132033]">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What will this session cover?"
                rows={3}
                className="w-full rounded-xl border border-[#D9E7EE] bg-white px-4 py-3 text-sm outline-none transition focus:border-crimson"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#132033]">Course ID</label>
                <Input
                  value={form.course_id}
                  onChange={(e) => update("course_id", e.target.value)}
                  placeholder="UUID of the course"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#132033]">Lesson ID</label>
                <Input
                  value={form.lesson_id}
                  onChange={(e) => update("lesson_id", e.target.value)}
                  placeholder="UUID of the lesson"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#132033]">
                  <Calendar className="mr-1 inline h-3.5 w-3.5" /> Start date & time
                </label>
                <Input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => update("starts_at", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#132033]">
                  <Clock className="mr-1 inline h-3.5 w-3.5" /> End time (optional)
                </label>
                <Input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(e) => update("ends_at", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#132033]">Timezone</label>
              <Input
                value={form.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                placeholder="UTC"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#132033]">Classroom mode</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => update("mode", m.value)}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      form.mode === m.value
                        ? "border-crimson bg-crimson-soft"
                        : "border-[var(--border)] bg-white hover:border-[#D8CCC6]"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-[#132033]">
                      {m.icon} {m.label}
                    </div>
                    <p className="mt-1 text-xs text-[#61758A]">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => void router.navigate({ to: "/institution/sessions" })}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending} className="bg-crimson hover:bg-crimson-dark">
            {mutation.isPending ? "Scheduling…" : "Schedule Session"}
          </Button>
        </div>
      </form>
    </InstitutionShell>
  );
}

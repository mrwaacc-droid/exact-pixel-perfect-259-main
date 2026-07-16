import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Plus,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { setTeacherAvailability } from "@/lib/teacher-availability.functions";
import { requireTeacher } from "@/lib/route-guards";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/teacher/onboarding")({
  beforeLoad: (ctx) => requireTeacher(ctx.context),
  component: TeacherOnboardingWizard,
});

const STEPS = [
  { key: "welcome", label: "Welcome", icon: <Sparkles className="h-4 w-4" /> },
  { key: "profile", label: "Your Profile", icon: <Users className="h-4 w-4" /> },
  { key: "subjects", label: "Subjects", icon: <BookOpen className="h-4 w-4" /> },
  { key: "availability", label: "Availability", icon: <Calendar className="h-4 w-4" /> },
  { key: "complete", label: "Ready!", icon: <Check className="h-4 w-4" /> },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SUBJECT_OPTIONS = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Computer Science",
  "Economics",
  "Literature",
  "French",
  "Art & Design",
  "Physical Education",
  "Religious Studies",
];

function TeacherOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // ---- Profile state ----
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  // ---- Subjects state ----
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // ---- Availability state ----
  const [slots, setSlots] = useState<
    Array<{ day_of_week: number; start_time: string; end_time: string; timezone: string }>
  >([]);

  const saveAvailFn = useServerFn(setTeacherAvailability);
  const saveAvailMutation = useMutation({
    mutationFn: (institutionId: string) =>
      saveAvailFn({
        data: {
          institution_id: institutionId,
          slots: slots.map((s) => ({
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            timezone: s.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          })),
        },
      }),
    onError: (err: Error) => toast.error(err.message),
  });

  const addSlot = () =>
    setSlots((prev) => [
      ...prev,
      {
        day_of_week: 1,
        start_time: "09:00",
        end_time: "11:00",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      },
    ]);

  const removeSlot = (index: number) => setSlots((prev) => prev.filter((_, i) => i !== index));

  const updateSlot = (index: number, key: string, value: string | number) =>
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [key]: value } : s)));

  const toggleSubject = (subject: string) =>
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject],
    );

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const complete = async () => {
    if (slots.length > 0) {
      try {
        await saveAvailMutation.mutateAsync("demo-institution");
      } catch {
        // Non-blocking — user can set availability later in Settings
      }
    }
    toast.success("Welcome to Klassruum! Your teaching profile is set up.");
    void router.navigate({ to: "/teacher/dashboard" });
  };

  return (
    <div className="min-h-screen bg-[#F4F8FB]">
      <header className="border-b border-[#D9E7EE] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
              Teacher Onboarding
            </p>
            <h1 className="text-xl font-black text-[#132033]">Set Up Your Teaching Profile</h1>
          </div>
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div
                key={s.key}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                  i <= step
                    ? "bg-crimson text-white"
                    : "bg-[var(--border)] text-[#A89890]"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-crimson-soft">
                <WandSparkles className="h-7 w-7 text-crimson" />
              </div>
              <h2 className="text-2xl font-black text-[#132033]">Welcome to Klassruum!</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#61758A]">
                You've been invited to teach on Klassruum — a platform where AI and human teachers
                deliver world-class lessons to learners. Let's set up your profile in 3 quick steps.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: <Users className="h-5 w-5" />, title: "Your Profile", desc: "Name, bio, and photo" },
                  { icon: <BookOpen className="h-5 w-5" />, title: "Subjects", desc: "What you teach" },
                  { icon: <Calendar className="h-5 w-5" />, title: "Availability", desc: "When you can teach" },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-[var(--border)] bg-[#FAFCFE] p-4 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-crimson-soft text-crimson">
                      {item.icon}
                    </div>
                    <p className="font-bold text-[#132033]">{item.title}</p>
                    <p className="mt-1 text-xs text-[#61758A]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <Card>
            <CardContent className="space-y-5 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
                  Step 1 of 4
                </p>
                <h2 className="mt-2 text-xl font-black text-[#132033]">Your Teaching Profile</h2>
                <p className="mt-1 text-sm text-[#61758A]">
                  Learners and institutions will see this when they view your profile.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#132033]">Display name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Ms. Amani, Mr. Klass"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#132033]">Short bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell learners about your teaching experience and style..."
                  rows={4}
                  className="w-full rounded-xl border border-[#D9E7EE] bg-white px-4 py-3 text-sm outline-none transition focus:border-crimson"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Subjects */}
        {step === 2 && (
          <Card>
            <CardContent className="p-6">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
                  Step 2 of 4
                </p>
                <h2 className="mt-2 text-xl font-black text-[#132033]">Subjects You Teach</h2>
                <p className="mt-1 text-sm text-[#61758A]">
                  Select all subjects you're qualified to teach. This helps match you with the right
                  courses.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {SUBJECT_OPTIONS.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left text-sm font-semibold transition ${
                      selectedSubjects.includes(subject)
                        ? "border-crimson bg-crimson-soft text-crimson"
                        : "border-[var(--border)] bg-white text-[#132033] hover:border-[#D8CCC6]"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border ${
                        selectedSubjects.includes(subject)
                          ? "border-crimson bg-crimson"
                          : "border-[#D8CCC6] bg-white"
                      }`}
                    >
                      {selectedSubjects.includes(subject) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    {subject}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Availability */}
        {step === 3 && (
          <Card>
            <CardContent className="p-6">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
                    Step 3 of 4
                  </p>
                  <h2 className="mt-2 text-xl font-black text-[#132033]">Your Availability</h2>
                  <p className="mt-1 text-sm text-[#61758A]">
                    Set your weekly available time slots. Students can book sessions during these
                    windows.
                  </p>
                </div>
                <Button variant="outline" onClick={addSlot}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Slot
                </Button>
              </div>

              {slots.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D9E7EE] bg-[#FBFDFC] p-8 text-center">
                  <Clock className="mx-auto h-8 w-8 text-[#A89890]" />
                  <h3 className="mt-3 font-bold text-[#132033]">No slots yet</h3>
                  <p className="mt-1 text-sm text-[#61758A]">
                    You can skip this for now and set your availability later in Settings.
                  </p>
                  <Button className="mt-4 bg-crimson hover:bg-crimson-dark" onClick={addSlot}>
                    <Plus className="mr-1.5 h-4 w-4" /> Add Your First Slot
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border)] bg-[#FAFCFE] p-4"
                    >
                      <select
                        value={slot.day_of_week}
                        onChange={(e) => updateSlot(index, "day_of_week", Number(e.target.value))}
                        className="rounded-xl border border-[#D9E7EE] bg-white px-3 py-2 text-sm font-semibold text-[#132033] outline-none focus:border-crimson"
                      >
                        {DAYS.map((day, i) => (
                          <option key={day} value={i}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.start_time}
                          onChange={(e) => updateSlot(index, "start_time", e.target.value)}
                          className="w-28"
                        />
                        <span className="text-sm text-[#61758A]">to</span>
                        <Input
                          type="time"
                          value={slot.end_time}
                          onChange={(e) => updateSlot(index, "end_time", e.target.value)}
                          className="w-28"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSlot(index)}
                        className="ml-auto rounded-xl p-2 text-[#A89890] transition hover:bg-red-50 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7]">
                <Check className="h-8 w-8 text-[#15803D]" />
              </div>
              <h2 className="text-2xl font-black text-[#132033]">You're All Set!</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#61758A]">
                Your teaching profile is ready. Here's a summary:
              </p>
              <div className="mx-auto mt-6 max-w-md space-y-3 text-left">
                <div className="rounded-xl border border-[var(--border)] bg-[#FAFCFE] p-4">
                  <p className="text-xs font-bold uppercase text-[#7B8EA2]">Name</p>
                  <p className="font-semibold text-[#132033]">{displayName || "Not set"}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[#FAFCFE] p-4">
                  <p className="text-xs font-bold uppercase text-[#7B8EA2]">Subjects</p>
                  <p className="font-semibold text-[#132033]">
                    {selectedSubjects.length > 0 ? selectedSubjects.join(", ") : "None selected"}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[#FAFCFE] p-4">
                  <p className="text-xs font-bold uppercase text-[#7B8EA2]">Availability</p>
                  <p className="font-semibold text-[#132033]">
                    {slots.length > 0
                      ? `${slots.length} time slot${slots.length !== 1 ? "s" : ""}`
                      : "Set later in Settings"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {step > 0 ? (
            <Button variant="outline" onClick={prev}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < STEPS.length - 1 ? (
            <Button className="bg-crimson hover:bg-crimson-dark" onClick={next}>
              Continue <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button className="bg-crimson hover:bg-crimson-dark" onClick={complete}>
              Go to Dashboard <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

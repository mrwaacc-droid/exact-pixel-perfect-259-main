import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import {
  Calendar,
  Check,
  Clock,
  Loader2,
  Plus,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMyInstitutions } from "@/lib/institutions.functions";
import {
  setTeacherAvailability,
  getTeacherAvailability,
} from "@/lib/teacher-availability.functions";
import { requireInstitutionStaff } from "@/lib/route-guards";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/teacher/settings")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: TeacherSettingsPage,
});

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Slot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

function TeacherSettingsPage() {
  const myFn = useServerFn(getMyInstitutions);
  const my = useQuery({ queryKey: ["my-institutions"], queryFn: () => myFn() });
  const institutionId = my.data?.memberships?.[0]?.institution?.id;

  const getAvailFn = useServerFn(getTeacherAvailability);
  const { data: availData, isLoading: availLoading } = useQuery({
    queryKey: ["teacher-availability", institutionId],
    queryFn: () => getAvailFn({ data: { institution_id: institutionId! } }),
    enabled: !!institutionId,
  });

  const setAvailFn = useServerFn(setTeacherAvailability);
  const mutation = useMutation({
    mutationFn: (slots: Slot[]) =>
      setAvailFn({ data: { institution_id: institutionId!, slots } }),
    onSuccess: () => toast.success("Availability saved!"),
    onError: (err: Error) => toast.error(err.message),
  });

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load existing slots
  useEffect(() => {
    if (availData?.slots && !loaded) {
      setSlots(
        availData.slots.map((s: any) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time?.slice(0, 5) ?? "09:00",
          end_time: s.end_time?.slice(0, 5) ?? "11:00",
          timezone: s.timezone ?? "UTC",
        })),
      );
      setLoaded(true);
    }
  }, [availData, loaded]);

  const addSlot = () => {
    setSlots((prev) => [
      ...prev,
      {
        day_of_week: 1,
        start_time: "09:00",
        end_time: "11:00",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      },
    ]);
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, key: keyof Slot, value: string | number) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [key]: value } : s)),
    );
  };

  const save = () => {
    if (!institutionId) return;
    mutation.mutate(slots);
  };

  return (
    <DashboardShell
      config={dashboardConfigs.teacher}
      activePath="/teacher/settings"
      title="Teacher Settings"
      subtitle="Manage your availability, profile, and teaching preferences."
    >
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Availability section */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
                  <Calendar className="h-3.5 w-3.5" /> Availability
                </div>
                <h2 className="mt-2 text-xl font-black text-[#132033]">
                  Your Teaching Schedule
                </h2>
                <p className="mt-1 text-sm text-[#61758A]">
                  Set your weekly available time slots. Students can book sessions during these
                  windows.
                </p>
              </div>
              <Button variant="outline" onClick={addSlot}>
                <Plus className="mr-1.5 h-4 w-4" /> Add Slot
              </Button>
            </div>

            {availLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-crimson" />
              </div>
            ) : slots.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D9E7EE] bg-[#FBFDFC] p-8 text-center">
                <Clock className="mx-auto h-8 w-8 text-[#A89890]" />
                <h3 className="mt-3 font-bold text-[#132033]">No availability set</h3>
                <p className="mt-1 text-sm text-[#61758A]">
                  Add your available time slots so students can find and book your sessions.
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

                    <Input
                      value={slot.timezone}
                      onChange={(e) => updateSlot(index, "timezone", e.target.value)}
                      className="w-36"
                      placeholder="Timezone"
                    />

                    <button
                      type="button"
                      onClick={() => removeSlot(index)}
                      className="ml-auto rounded-xl p-2 text-[#A89890] transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {slots.length > 0 && (
              <div className="mt-5 flex justify-end">
                <Button
                  onClick={save}
                  disabled={mutation.isPending}
                  className="bg-crimson hover:bg-crimson-dark"
                >
                  {mutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Availability
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile ownership notice */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
              <Settings className="h-3.5 w-3.5" /> Profile
            </div>
            <h2 className="mt-2 text-xl font-black text-[#132033]">Teaching Profile</h2>
            <p className="mt-1 text-sm text-[#61758A]">
              Your teaching profile is managed by your institution admin. Contact them to update
              your name, subjects, or teaching style preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

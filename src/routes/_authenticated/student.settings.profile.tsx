import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { StudentShell } from "@/components/student/StudentShell";
import { requireStudent } from "@/lib/route-guards";
import { getProfile, updateProfile } from "@/lib/student.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/student/settings/profile")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentProfileEdit,
});

function StudentProfileEdit() {
  const fn = useServerFn(getProfile);
  const updateFn = useServerFn(updateProfile);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["student-profile"], queryFn: () => fn() });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (q.data) {
      setFullName(q.data.fullName ?? "");
      setPhone(q.data.phone ?? "");
      setAvatarUrl(q.data.avatarUrl ?? "");
    }
  }, [q.data]);

  const mutation = useMutation({
    mutationFn: (input: { fullName: string; phone: string | null; avatarUrl: string | null }) =>
      updateFn({ data: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-profile"] });
      toast.success("Profile updated");
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not update profile"),
  });

  const save = () =>
    mutation.mutate({
      fullName: fullName.trim(),
      phone: phone.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
    });

  return (
    <StudentShell title="Profile">
      <div className="mx-auto max-w-xl space-y-5">
        {q.isLoading ? (
          <p className="text-sm text-[var(--gray-500)]">Loading profile…</p>
        ) : (
          <>
            <div className="kr-pcard space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--gray-400)]">
                  Full name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--gray-200)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--gray-400)]">
                  Email (read-only)
                </label>
                <input
                  value={q.data?.email ?? ""}
                  disabled
                  className="w-full rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 py-2 text-sm text-[var(--gray-500)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--gray-400)]">
                  Phone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[var(--gray-200)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--gray-400)]">
                  Avatar URL
                </label>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-xl border border-[var(--gray-200)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={save}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-crimson px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-crimson-dark"
            >
              {mutation.isPending ? "Saving…" : "Save changes"}
            </button>
          </>
        )}
      </div>
    </StudentShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { requireTeacher } from "@/lib/route-guards";
import { getStudentMessages, sendStudentMessage } from "@/lib/student.functions";

export const Route = createFileRoute("/_authenticated/teacher/messages")({
  beforeLoad: (ctx) => requireTeacher(ctx.context),
  component: TeacherMessages,
});

function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function TeacherMessages() {
  const fn = useServerFn(getStudentMessages);
  const sendFn = useServerFn(sendStudentMessage);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["teacher-messages"], queryFn: () => fn() });
  const messages = q.data?.messages ?? [];

  const threads = useMemo(() => {
    const map = new Map<
      string,
      { peerId: string; peerName: string; institutionId: string; courseId: string | null; messages: typeof messages }
    >();
    for (const m of messages) {
      const peerId = m.isMine ? m.recipientId : m.senderId;
      const peerName = m.isMine ? "Recipient" : m.senderName;
      if (!map.has(peerId)) {
        map.set(peerId, {
          peerId,
          peerName,
          institutionId: m.institutionId,
          courseId: m.courseId,
          messages: [],
        });
      }
      map.get(peerId)!.messages.push(m);
    }
    return Array.from(map.values());
  }, [messages]);

  const [activePeer, setActivePeer] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const activeThread = threads.find((t) => t.peerId === activePeer) ?? threads[0] ?? null;

  const mutation = useMutation({
    mutationFn: (input: {
      recipientId: string;
      institutionId: string;
      body: string;
      courseId: string | null;
    }) => sendFn({ data: input }),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["teacher-messages"] });
    },
  });

  const send = () => {
    if (!activeThread || !draft.trim()) return;
    mutation.mutate({
      recipientId: activeThread.peerId,
      institutionId: activeThread.institutionId,
      courseId: activeThread.courseId,
      body: draft.trim(),
    });
  };

  return (
    <DashboardShell
      config={dashboardConfigs.teacher}
      activePath="/teacher/messages"
      title="Messages"
      subtitle="Conversations with students in your courses."
    >
      {q.isLoading ? (
        <p className="text-sm text-[var(--gray-500)]">Loading messages…</p>
      ) : threads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--gray-200)] bg-white p-10 text-center">
          <MessageSquare className="mx-auto mb-2 h-8 w-8 text-[var(--gray-400)]" />
          <p className="text-sm font-semibold text-[var(--gray-900)]">No messages yet</p>
          <p className="mt-1 text-sm text-[var(--gray-500)]">
            Conversations with your students will appear here once they start.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <div className="space-y-2">
            {threads.map((t) => (
              <button
                key={t.peerId}
                onClick={() => setActivePeer(t.peerId)}
                className={`kr-pcard block w-full p-3 text-left ${activeThread?.peerId === t.peerId ? "ring-2 ring-[var(--primary)]" : ""}`}
              >
                <p className="truncate font-semibold text-[var(--gray-900)]">{t.peerName}</p>
                <p className="truncate text-xs text-[var(--gray-500)]">
                  {t.messages[t.messages.length - 1]?.body}
                </p>
              </button>
            ))}
          </div>

          <div className="kr-pcard flex h-[60vh] flex-col p-0">
            <div className="border-b border-[var(--gray-100)] px-4 py-3">
              <p className="font-semibold text-[var(--gray-900)]">{activeThread?.peerName}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {activeThread?.messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                      m.isMine ? "bg-crimson text-white" : "bg-[var(--gray-100)] text-[var(--gray-900)]"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.body}</p>
                    <p className={`mt-1 text-[10px] ${m.isMine ? "text-white/70" : "text-[var(--gray-400)]"}`}>
                      {formatTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-[var(--gray-100)] p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Write a reply…"
                className="flex-1 rounded-xl border border-[var(--gray-200)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              />
              <button
                onClick={send}
                disabled={!draft.trim() || mutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-crimson px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> Send
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

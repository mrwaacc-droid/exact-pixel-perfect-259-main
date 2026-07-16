import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Accessibility,
  ArrowLeft,
  Eye,
  Hand,
  Headphones,
  MessageSquare,
  Mic,
  Monitor,
  Send,
  Sparkles,
  Subtitles,
  Users,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type LearnerLiveClassroomPageProps = {
  sessionId: string;
  classroomContext: any;
  onLeaveSession: () => Promise<void> | void;
  onAskQuestion: (message: string) => Promise<void> | void;
};

function formatMode(mode?: string) {
  switch (mode) {
    case "human_teacher":
      return "Live teacher classroom";
    case "hybrid":
      return "Hybrid live classroom";
    default:
      return "Live classroom";
  }
}

export function LearnerLiveClassroomPage({
  sessionId,
  classroomContext,
  onLeaveSession,
  onAskQuestion,
}: LearnerLiveClassroomPageProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  const session = classroomContext?.session ?? {};
  const lesson = classroomContext?.lesson ?? {};
  const course = classroomContext?.course ?? {};
  const institution = classroomContext?.institution ?? {};
  const messages = Array.isArray(classroomContext?.messages) ? classroomContext.messages : [];

  const transcriptLine = useMemo(() => {
    const latestTeacherMessage = [...messages]
      .reverse()
      .find((entry: any) => entry.sender === "teacher" || entry.sender === "ai_teacher");
    return (
      latestTeacherMessage?.message ??
      `Welcome to ${lesson.title ?? "the live lesson"}. Follow the board, captions, and teacher prompts.`
    );
  }, [lesson.title, messages]);

  const quickSignals = [
    "Please repeat that last step.",
    "I understand so far.",
    "Can you slow down a little?",
    "I need help with this example.",
  ];

  const send = async (value: string) => {
    const content = value.trim();
    if (!content) return;
    setSending(true);
    try {
      await onAskQuestion(content);
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-[#132033]">
      <header className="sticky top-0 z-30 border-b border-[#D9E7EE] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/student/classrooms"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9E7EE] bg-white text-[#365978] transition hover:bg-[#F8FBFD]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">{formatMode(session.mode)}</p>
              <h1 className="truncate text-lg font-black">{lesson.title ?? "Live lesson"}</h1>
              <p className="truncate text-sm text-[#61758A]">{course.title ?? "Course"} · {institution.name ?? "Institution"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <div className="hidden rounded-full border border-[#D9E7EE] bg-[#F8FBFD] px-3 py-1.5 text-xs font-semibold text-[#476277] sm:inline-flex sm:items-center sm:gap-2">
              <Users className="h-3.5 w-3.5" /> 1 teacher · class live
            </div>
            <Button variant="outline" className="border-[#D9E7EE] text-[#27465F]" onClick={() => void onLeaveSession()}>
              Leave class
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 xl:grid-cols-[1.45fr_.95fr] lg:px-6">
        <section className="space-y-6">
          <div className="rounded-[30px] border border-[#D9E7EE] bg-white p-5 shadow-[0_16px_50px_rgba(25, 19, 20,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">Teacher stage</p>
                <h2 className="mt-2 text-xl font-black text-[#132033]">What the learner sees live</h2>
              </div>
              <div className="rounded-full bg-[#EAF8F7] px-3 py-1 text-xs font-semibold text-[#7D2233]">
                Teacher speaking live
              </div>
            </div>

            <div className="rounded-[24px] border border-[#E2EBF2] bg-[linear-gradient(135deg,#191314,#17324A)] p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">Live stream</p>
                  <h3 className="mt-2 text-lg font-bold">Teacher voice / camera area</h3>
                </div>
                <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
                  Human teacher
                </div>
              </div>

              <div className="mt-5 flex min-h-[280px] items-center justify-center rounded-[20px] border border-white/10 bg-[radial-gradient(circle_at_top,#27465F,transparent_55%),linear-gradient(135deg,#111827,#0B1220)]">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                    <Volume2 className="h-9 w-9 text-white" />
                  </div>
                  <p className="mt-4 text-lg font-semibold">Teacher presentation stage</p>
                  <p className="mt-1 text-sm text-white/65">
                    Learners see the live teacher stream, hear audio, and follow captions here.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-[#E2EBF2] bg-[#FBFDFC] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">Shared lesson board</p>
                  <h3 className="mt-2 text-lg font-bold text-[#132033]">Board, slides, and live teaching cues</h3>
                </div>
                <Monitor className="h-5 w-5 text-[#7D2233]" />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  lesson.title ?? "Live lesson topic",
                  "Current explanation and worked examples",
                  "Teacher highlights and board annotations",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-[#E0EAF1] bg-white p-4 text-sm font-semibold text-[#27465F]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#D9E7EE] bg-white p-5 shadow-[0_12px_40px_rgba(25, 19, 20,0.07)]">
            <div className="flex flex-wrap gap-3">
              {quickSignals.map((signal) => (
                <button
                  key={signal}
                  type="button"
                  onClick={() => void send(signal)}
                  className="rounded-full border border-[#DCE7EE] bg-[#F8FBFD] px-4 py-2 text-sm font-semibold text-[#35546F] transition hover:border-[#7D2233]/35 hover:bg-[#F3FBFA]"
                >
                  {signal}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setHandRaised((prev) => !prev);
                  void send(handRaised ? "I lowered my hand." : "I have raised my hand for help.");
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  handRaised
                    ? "bg-[#7D2233] text-white"
                    : "border border-[#DCE7EE] bg-[#F8FBFD] text-[#35546F] hover:border-[#7D2233]/35 hover:bg-[#F3FBFA]"
                }`}
              >
                <Hand className="mr-2 inline h-4 w-4" />
                {handRaised ? "Hand raised" : "Raise hand"}
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[30px] border border-[#D9E7EE] bg-white p-5 shadow-[0_12px_40px_rgba(25, 19, 20,0.07)]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
              <Subtitles className="h-4 w-4 text-[#7D2233]" /> Live captions
            </div>
            <p className="mt-4 rounded-[22px] border border-[#E2EBF2] bg-[#F8FBFD] p-4 text-sm leading-7 text-[#29455D]">
              {transcriptLine}
            </p>
          </div>

          <div className="rounded-[30px] border border-[#D9E7EE] bg-white p-5 shadow-[0_12px_40px_rgba(25, 19, 20,0.07)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">Question panel</p>
                <h2 className="mt-2 text-xl font-black text-[#132033]">What learners can do</h2>
              </div>
              <MessageSquare className="h-5 w-5 text-[#7D2233]" />
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-[#E2EBF2] bg-[#FBFDFC] p-4 text-sm text-[#5C7185]">
                Ask a question, raise a hand, respond to the teacher, or ask for a slower explanation.
              </div>
              <div className="rounded-2xl border border-[#E2EBF2] bg-[#FBFDFC] p-4 text-sm text-[#5C7185]">
                The learner sees captions, notes support, and the current live board without extra clutter.
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a question for the teacher"
                className="h-11 flex-1 rounded-xl border border-[#D9E7EE] bg-white px-4 text-sm outline-none transition focus:border-[#7D2233]"
              />
              <Button
                onClick={() => void send(message)}
                disabled={sending || !message.trim()}
                className="h-11 bg-[#7D2233] hover:bg-[var(--crimson-dark)]"
              >
                <Send className="mr-2 h-4 w-4" /> Send
              </Button>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#D9E7EE] bg-white p-5 shadow-[0_12px_40px_rgba(25, 19, 20,0.07)]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
              <Sparkles className="h-4 w-4 text-[#7D2233]" /> Learner support area
            </div>
            <div className="mt-4 grid gap-3">
              {[
                { icon: <Eye className="h-4 w-4" />, label: "Captions on", desc: "Follow spoken teaching in text" },
                { icon: <Headphones className="h-4 w-4" />, label: "Teacher audio", desc: "Hear the lesson live" },
                { icon: <Accessibility className="h-4 w-4" />, label: "Accessibility", desc: "Focus mode, notes, and reading support" },
                { icon: <Mic className="h-4 w-4" />, label: "Participation", desc: "Respond by voice or typed question" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-[#E2EBF2] bg-[#FAFCFE] p-4">
                  <div className="mt-0.5 rounded-xl bg-white p-2 text-[#7D2233] ring-1 ring-[#E3EDF3]">{item.icon}</div>
                  <div>
                    <p className="font-semibold text-[#132033]">{item.label}</p>
                    <p className="mt-1 text-sm text-[#61758A]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
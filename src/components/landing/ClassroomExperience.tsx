import { Link } from "@tanstack/react-router";
import { ArrowRight, Mic, MessageSquare, Eye, FileText } from "lucide-react";
import { CineReveal } from "./CineReveal";

const classroomMoments = [
  "Teacher presence",
  "Learner question",
  "Confusion noticed",
  "Explanation adjusted",
  "Progress shared",
];

const capabilities = [
  { icon: Mic, title: "Voice-led teaching", desc: "The AI teacher speaks naturally, pacing explanations to match the learner's level." },
  { icon: MessageSquare, title: "Live questions", desc: "Learners ask questions at any point and receive contextual, adaptive answers." },
  { icon: Eye, title: "Difficulty detection", desc: "The system notices when a learner struggles and adjusts the explanation instantly." },
  { icon: FileText, title: "Saved evidence", desc: "Every session produces notes, transcripts, and progress records for review." },
];

export function ClassroomExperience() {
  return (
    <section className="cine-section cine-classroom" id="classroom">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <CineReveal>
              <span className="cine-section-eyebrow">Live classroom engine</span>
              <h2 className="cine-section-title">
                A classroom designed around teaching, not tools.
              </h2>
              <p className="cine-section-sub mt-5">
                Every element serves the lesson. Teacher voice, learners asking questions, visible difficulty, and family updates all stay connected to the same learning moment — so no learner falls behind silently.
              </p>
            </CineReveal>

            <CineReveal delay={2} className="mt-10 flex flex-wrap gap-3">
              {classroomMoments.map((moment) => (
                <span key={moment} className="cine-moment">
                  <span className="cine-moment-dot" />
                  {moment}
                </span>
              ))}
            </CineReveal>

            <CineReveal delay={3} className="mt-10 grid gap-5 sm:grid-cols-2">
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div key={cap.title} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/8 border border-white/10">
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-white">{cap.title}</p>
                      <p className="text-[14px] leading-relaxed text-white/60">{cap.desc}</p>
                    </div>
                  </div>
                );
              })}
            </CineReveal>

            <CineReveal delay={4} className="mt-10">
              <Link to="/demo/classroom" className="cine-final-btn" style={{ background: "#fff", color: "var(--ink)" }}>
                Experience the classroom
                <ArrowRight size={16} />
              </Link>
            </CineReveal>
          </div>

          <CineReveal variant="right" delay={1} className="cine-image-wrap">
            <img
              src="/images/scenes/cinematic-06.png"
              alt="Live classroom experience with AI teacher presence, learner questions, adaptive support, and saved progress"
              className="cine-classroom-image"
              loading="lazy"
            />
          </CineReveal>
        </div>
      </div>
    </section>
  );
}

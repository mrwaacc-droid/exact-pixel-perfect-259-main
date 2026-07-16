import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bot, User, Users, Radio, PenTool, MessageCircleQuestion, BarChart3, Eye, ArrowRight, Clock, Globe, Headphones } from "lucide-react";
import { CineReveal } from "./CineReveal";

const modes = [
  {
    id: "ai-led",
    icon: Bot,
    label: "AI-led",
    title: "Autonomous AI teaching",
    description:
      "The AI teacher delivers the full lesson independently — speaking, writing on the board, asking comprehension questions, and adapting explanations when a learner struggles. No human intervention required, yet every session produces a complete learning record.",
    features: [
      { icon: PenTool, text: "Full lesson delivery from start to finish with board work" },
      { icon: MessageCircleQuestion, text: "Real-time question handling and adaptive responses" },
      { icon: BarChart3, text: "Automatic progress tracking and learning evidence" },
      { icon: Clock, text: "Available 24/7 — learners can join anytime, anywhere" },
    ],
  },
  {
    id: "human-led",
    icon: User,
    label: "Human-led",
    title: "Teacher-supervised sessions",
    description:
      "A human teacher leads the live session while the AI provides real-time support — generating board content, suggesting examples, and surfacing questions from the class. The teacher stays in control of pace and flow, with AI as a teaching assistant.",
    features: [
      { icon: Eye, text: "Teacher controls the pace, flow, and classroom direction" },
      { icon: Bot, text: "AI assists with board work, examples, and explanations" },
      { icon: MessageCircleQuestion, text: "Suggested questions and prompts from the AI co-pilot" },
      { icon: Headphones, text: "Live captions and transcripts captured automatically" },
    ],
  },
  {
    id: "hybrid",
    icon: Users,
    label: "Hybrid",
    title: "AI + human collaboration",
    description:
      "The AI teacher handles routine instruction and core content delivery, while the human teacher focuses on individual support, classroom discussions, and complex questions. Combined evidence from both sources gives institutions a complete picture of learning.",
    features: [
      { icon: Bot, text: "AI delivers core lesson content and checks understanding" },
      { icon: User, text: "Teacher handles questions, discussions, and personal support" },
      { icon: BarChart3, text: "Combined evidence from AI and human teaching sources" },
      { icon: Globe, text: "Works across in-person, remote, and hybrid classroom setups" },
    ],
  },
];

export function LiveHybridClassrooms() {
  const [activeMode, setActiveMode] = useState("ai-led");
  const currentMode = modes.find((m) => m.id === activeMode)!;

  return (
    <section className="cine-section cine-hybrid" id="hybrid-classrooms">
      <div className="mx-auto max-w-[1240px] px-6">
        <CineReveal className="mx-auto mb-12 max-w-2xl text-center">
          <span className="cine-section-eyebrow justify-center">
            <Radio size={12} />
            Flexible delivery
          </span>
          <h2 className="cine-section-title">
            AI-led, human-led, or hybrid — your choice
          </h2>
          <p className="cine-section-sub mt-5 mx-auto">
            Klassruum adapts to your institution's teaching model. Run fully autonomous AI lessons, let human teachers lead with AI support, or blend both into a collaborative classroom. Every mode produces transcripts, notes, and progress records.
          </p>
        </CineReveal>

        <CineReveal delay={1} className="mb-12 flex flex-wrap justify-center gap-3">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`cine-mode-tab ${isActive ? "cine-mode-tab--active" : ""}`}
              >
                <Icon size={16} />
                {mode.label}
              </button>
            );
          })}
        </CineReveal>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <CineReveal variant="left">
            <h3 className="text-[26px] font-extrabold text-ink leading-tight mb-4">
              {currentMode.title}
            </h3>
            <p className="text-[17px] leading-relaxed text-muted mb-8">
              {currentMode.description}
            </p>

            <div>
              {currentMode.features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.text} className="cine-feature-row">
                    <div className="cine-feature-icon">
                      <Icon size={18} />
                    </div>
                    <p className="cine-feature-text">{feature.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/demo/classroom" className="cine-btn-primary" style={{ height: "44px", fontSize: "14px" }}>
                Try {currentMode.label} mode
                <ArrowRight size={14} />
              </Link>
              <Link to="/institutions/register" className="cine-btn-ghost" style={{ height: "44px", fontSize: "14px" }}>
                Talk to our team
              </Link>
            </div>
          </CineReveal>

          <CineReveal variant="right" delay={1} className="cine-image-wrap">
            <img
              src="/images/scenes/cinematic-07.png"
              alt={`${currentMode.title} — hybrid classroom showing AI and human teacher collaboration with live board work`}
              className="cine-image"
              loading="lazy"
            />
          </CineReveal>
        </div>
      </div>
    </section>
  );
}
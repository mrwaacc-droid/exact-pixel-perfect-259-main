import { BookOpen, Sparkles, GraduationCap, FileText } from "lucide-react";
import { CineReveal } from "./CineReveal";

const stages = [
  {
    number: "01",
    title: "Course materials",
    description:
      "A teacher or institution brings the approved curriculum, resources, and examples into one teaching flow. Upload PDFs, slides, and notes — Klassruum organises them into a structured lesson plan ready for AI delivery.",
    icon: BookOpen,
    image: "/images/scenes/cinematic-02.png",
    alt: "Teacher preparing and uploading approved course materials into Klassruum",
  },
  {
    number: "02",
    title: "Structured lesson",
    description:
      "The lesson is shaped into a sequence learners can follow — introduction, explanation, examples, and checks. Support checkpoints are built in, ready to trigger when a learner encounters difficulty.",
    icon: Sparkles,
    image: "/images/scenes/cinematic-03.png",
    alt: "Lesson structured into a clear sequence with support checkpoints and examples",
  },
  {
    number: "03",
    title: "AI teacher delivery",
    description:
      "The AI teacher presence explains concepts aloud, writes on the board, asks comprehension questions, and adapts explanations when a learner gets stuck — just like a real classroom session.",
    icon: GraduationCap,
    image: "/images/scenes/cinematic-04.png",
    alt: "AI teacher delivering a lesson with voice, whiteboard, and live questions",
  },
  {
    number: "04",
    title: "Learning evidence",
    description:
      "Families and institutions see progress, support needs, and learning records without losing the human rhythm. Transcripts, notes, and progress data are saved automatically after every session.",
    icon: FileText,
    image: "/images/scenes/cinematic-05.png",
    alt: "Learning evidence, transcripts, and progress records shared with families and institutions",
  },
];

export function LearningJourney() {
  return (
    <section className="cine-section bg-white" id="how-it-works">
      <div className="mx-auto max-w-[1240px] px-6">
        <CineReveal className="mb-16 max-w-2xl">
          <span className="cine-section-eyebrow">How course content becomes teaching</span>
          <h2 className="cine-section-title">
            From curriculum to classroom in four stages
          </h2>
          <p className="cine-section-sub mt-5">
            Turn raw teaching materials into a guided learning experience, with visible support for teachers, learners, institutions, and families.
          </p>
        </CineReveal>

        <div className="cine-journey">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const reverse = index % 2 === 1;
            return (
              <CineReveal
                key={stage.number}
                variant={reverse ? "right" : "left"}
                className={`cine-journey-item ${reverse ? "cine-journey-item--reverse" : ""}`}
              >
                <div className="cine-journey-media">
                  <img
                    src={stage.image}
                    alt={stage.alt}
                    className="cine-image"
                    loading="lazy"
                  />
                </div>

                <div className="cine-journey-copy">
                  <div className="flex items-center gap-3">
                    <span className="cine-journey-num">{stage.number}</span>
                    <Icon size={18} className="text-crimson-dark" />
                  </div>
                  <h3 className="cine-journey-title">{stage.title}</h3>
                  <p className="cine-journey-desc">{stage.description}</p>
                </div>
              </CineReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
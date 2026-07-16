import { ArrowRight, Briefcase, Heart, Landmark, Monitor, School, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CineReveal } from "./CineReveal";

type SolutionHref =
  | "/solutions/schools"
  | "/solutions/universities"
  | "/solutions/training-providers"
  | "/solutions/tutoring-centers"
  | "/solutions/ngos"
  | "/solutions/online-academies";

const solutions = [
  {
    id: "school",
    title: "Schools",
    description: "Keep teaching consistent across classes while every learner gets guided support. Upload your curriculum, assign teachers, and let AI deliver structured lessons with live captions and progress tracking.",
    icon: School,
    href: "/solutions/schools" as SolutionHref,
    tag: "Curriculum delivery",
    image: "/images/scenes/schools.png",
  },
  {
    id: "university",
    title: "Universities",
    description: "Support large cohorts with explainers, comprehension checks, and learning records beyond the lecture hall. Scale teaching without scaling headcount.",
    icon: Landmark,
    href: "/solutions/universities" as SolutionHref,
    tag: "Large cohorts",
    image: "/images/scenes/universities.png",
  },
  {
    id: "training",
    title: "Training organisations",
    description: "Turn policies, compliance manuals, and onboarding materials into taught sessions that people actually complete — with evidence of understanding for every learner.",
    icon: Briefcase,
    href: "/solutions/training-providers" as SolutionHref,
    tag: "Workplace learning",
    image: "/images/scenes/training.png",
  },
  {
    id: "tutoring",
    title: "Tutoring centres",
    description: "Scale one-to-one support with adaptive explanations and small-group practice. The AI teacher handles routine instruction while tutors focus on individual needs.",
    icon: Users,
    href: "/solutions/tutoring-centers" as SolutionHref,
    tag: "Guided practice",
    image: "/images/scenes/tutoring.png",
  },
  {
    id: "ngo",
    title: "NGOs",
    description: "Deliver accessible teaching where staff, language, or connectivity is constrained. Offline-friendly lessons, multilingual captions, and WCAG 2.2 accessibility built in.",
    icon: Heart,
    href: "/solutions/ngos" as SolutionHref,
    tag: "Inclusive access",
    image: "/images/scenes/ngos.png",
  },
  {
    id: "academy",
    title: "Online academies",
    description: "Replace passive course libraries with teacher-led digital classroom experiences. AI teachers deliver live-style lessons with board work, questions, and saved progress.",
    icon: Monitor,
    href: "/solutions/online-academies" as SolutionHref,
    tag: "Digital campus",
    image: "/images/scenes/academies.png",
  },
];

export function Solutions() {
  return (
    <section className="cine-section" id="solutions" style={{ background: "#FBF8F5" }}>
      <div className="mx-auto max-w-[1240px] px-6">
        <CineReveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="cine-section-eyebrow justify-center">Use cases</span>
          <h2 className="cine-section-title">
            Every campus has a different teaching job.
          </h2>
          <p className="cine-section-sub mt-5 mx-auto">
            Klassruum adapts the same core teaching loop to the institution using it: explain the material, work through examples, check understanding, and leave a usable learning record.
          </p>
        </CineReveal>

        <div>
          {solutions.map((sol, i) => (
            <CineReveal key={sol.id} delay={((i % 3) + 1) as 1 | 2 | 3} variant="up">
              <Link to={sol.href} className="cine-solution-row group">
                <img
                  src={sol.image}
                  alt={`${sol.title} using Klassruum for ${sol.tag.toLowerCase()}`}
                  className="cine-solution-image"
                  loading="lazy"
                />

                <div>
                  <p className="cine-solution-tag">{sol.tag}</p>
                  <h3 className="cine-solution-title">{sol.title}</h3>
                  <p className="cine-solution-desc">{sol.description}</p>
                </div>

                <div className="cine-solution-arrow">
                  <ArrowRight size={18} />
                </div>
              </Link>
            </CineReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

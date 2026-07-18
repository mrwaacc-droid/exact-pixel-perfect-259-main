import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CineReveal } from "./CineReveal";

const faqItems = [
  {
    question: "What is Klassruum and how does it work?",
    answer:
      "Klassruum is an AI-powered virtual classroom platform that turns institution-approved course materials into structured, taught lessons. An AI teacher delivers each lesson with voice narration, whiteboard work, live captions, comprehension questions, and saved progress — giving every learner a consistent, high-quality classroom experience. Institutions upload PDFs, slides, and syllabi; Klassruum organises them into lesson plans that a teacher or admin reviews before publishing.",
  },
  {
    question: "How does the AI teacher deliver lessons?",
    answer:
      "The AI teacher follows a pre-developed lesson plan step by step: it introduces the topic, writes key points on the whiteboard, explains concepts aloud, asks checkpoint questions, and adapts its pacing when a learner shows signs of confusion. It uses only the institution's approved materials — not the open web — so every explanation stays on-curriculum.",
  },
  {
    question: "Is Klassruum just a chatbot or AI tutor?",
    answer:
      "No. Klassruum delivers a complete, structured lesson from start to finish inside a virtual classroom — not a chat window. The AI teacher speaks, writes on the board, asks questions, detects difficulty, and produces learning evidence. The classroom is the product; conversation is one feature inside it.",
  },
  {
    question: "Can parents track their child's learning progress?",
    answer:
      "Yes. The Family View gives parents a clear picture of their child's learning: courses enrolled, progress percentages, lessons completed, time spent, and supportive updates like 'Making steady progress'. Parents see encouraging, transparent information rather than surveillance-style metrics.",
  },
  {
    question: "What is the difference between AI-led, human-led, and hybrid classrooms?",
    answer:
      "In AI-led mode, the AI teacher delivers the full lesson autonomously — ideal for self-paced or after-hours learning. In human-led mode, a teacher controls the session while the AI provides board work and suggested questions. In hybrid mode, the AI handles routine instruction while the human teacher focuses on individual support, discussions, and complex questions. Institutions choose the model that fits their teaching philosophy.",
  },
  {
    question: "How does Klassruum handle assignments and homework?",
    answer:
      "Assignments are linked to specific lessons with clear due dates, estimated completion times, and attached resources. Learners see their work organised by status: To do, In progress, Submitted, Feedback received, and Completed. Supported types include practice questions, written responses, reflections, and file submissions.",
  },
  {
    question: "What learning evidence does Klassruum generate?",
    answer:
      "Every session automatically produces a transcript, completion rate, time spent record, questions asked log, saved notes, and areas needing review. Institutions and families can export this evidence as PDF transcripts, CSV progress reports, or weekly summaries — giving concrete proof of learning for compliance, accreditation, or parent communication.",
  },
  {
    question: "How does Klassruum protect learner data and privacy?",
    answer:
      "Klassruum uses role-based access control, institution-controlled content, private learner records, and strict AI-data boundaries. The AI teacher references only approved materials. Data retention is configurable per institution, full audit history is maintained, and data export and deletion are supported. The platform is designed for GDPR compliance.",
  },
  {
    question: "Can institutions upload and teach from their own course content?",
    answer:
      "Yes. Upload PDFs, slides, documents, syllabi, and images, and Klassruum generates structured lesson plans for a teacher or admin to review and publish. Nothing is taught without institutional approval — the institution keeps full control over curriculum, pacing, and what the AI teacher says.",
  },
  {
    question: "How accessible is Klassruum for learners with disabilities?",
    answer:
      "Accessibility is built into every layer: live captions, full transcripts, keyboard navigation, screen reader support, high contrast mode, large text, reduced motion, focus mode, adjustable speech speed, and text-first or voice-first question modes. Klassruum is designed to meet WCAG 2.2 accessibility standards.",
  },
  {
    question: "Does Klassruum support multiple languages?",
    answer:
      "Yes. Klassruum supports separate interface and teaching languages. A learner may use Swahili for the interface while learning in English with English captions and Swahili glossary support. The AI teacher can explain terms in the learner's preferred language without changing the academic language of the lesson.",
  },
  {
    question: "What types of institutions use Klassruum?",
    answer:
      "Klassruum is built for schools, universities, training organisations, tutoring centres, NGOs, and online academies. Each institution type has dedicated features and workflows. There are separate dashboard experiences for learners, teachers, institution administrators, and parents.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="cine-section" id="faq" style={{ background: "var(--white, #FFFFFF)" }}>
      <div className="mx-auto max-w-[1240px] px-6">
        <CineReveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="cine-section-eyebrow justify-center">Frequently asked questions</span>
          <h2 className="cine-section-title">
            Common questions about Klassruum
          </h2>
          <p className="cine-section-sub mt-5 mx-auto">
            Everything you need to know about the AI classroom platform, how the AI teacher works, and how Klassruum serves schools, universities, training organisations, and families.
          </p>
        </CineReveal>

        <div className="mx-auto max-w-3xl space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <CineReveal key={index} delay={((index % 3) + 1) as 1 | 2 | 3}>
                <div
                  className={`border transition-all duration-200 ${
                    isOpen
                      ? "border-crimson-dark bg-crimson-soft"
                      : "border-border bg-white hover:border-border-strong"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-expanded={isOpen}
                  >
                    <span className="pr-4 text-base font-bold text-heading">{item.question}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-muted transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className="text-sm leading-7 text-body">{item.answer}</p>
                    </div>
                  )}
                </div>
              </CineReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

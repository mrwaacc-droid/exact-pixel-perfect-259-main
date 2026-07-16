import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Play, BookOpen, Users, ShieldCheck } from "lucide-react";
import { CineReveal } from "./CineReveal";

export function Hero() {
  return (
    <section className="cine-hero" id="platform">
      <div className="cine-hero-bg" />

      <div className="cine-hero-content mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-24">
        <div className="max-w-xl">
          <CineReveal>
            <h1 className="cine-hero-title">
              AI teachers that deliver{" "}
              <span className="cine-hero-title-accent">real classroom lessons.</span>
            </h1>
          </CineReveal>

          <CineReveal delay={1}>
            <p className="cine-hero-sub mt-6">
              Turn institution-approved content into structured, accessible lessons taught through an AI teacher — with a learning whiteboard, live captions, interactive questions, and saved progress that families and institutions can review anytime. GDPR-compliant and WCAG 2.2 ready.
            </p>
          </CineReveal>

          <CineReveal delay={2}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/demo/classroom" className="cine-btn-primary">
                <Play size={15} />
                See the Classroom
              </Link>
              <Link to="/institutions/register" className="cine-btn-ghost">
                For Institutions
                <ArrowRight size={15} />
              </Link>
            </div>
          </CineReveal>

          <CineReveal delay={3}>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6">
              <Link to="/demo/classroom" className="flex items-center gap-2 text-[14px] font-semibold text-ink transition-colors hover:text-crimson-dark">
                <BookOpen size={15} className="text-crimson-dark" />
                Explore a live lesson
              </Link>
              <Link to="/auth" className="flex items-center gap-2 text-[14px] font-semibold text-ink transition-colors hover:text-crimson-dark">
                <Users size={15} className="text-crimson-dark" />
                Teacher tools
              </Link>
              <a href="#institutions" className="flex items-center gap-2 text-[14px] font-semibold text-ink transition-colors hover:text-crimson-dark">
                <ShieldCheck size={15} className="text-crimson-dark" />
                Institution control
              </a>
            </div>
          </CineReveal>

          <CineReveal delay={4}>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
              {[
                { num: "4", label: "Delivery modes" },
                { num: "WCAG 2.2", label: "Accessible by design" },
                { num: "24/7", label: "Always-on teaching" },
              ].map((stat) => (
                <div key={stat.label} className="cine-hero-stat">
                  <span className="cine-hero-stat-num">{stat.num}</span>
                  <span className="cine-hero-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </CineReveal>
        </div>

        <CineReveal variant="right" delay={2} className="cine-hero-image-wrap">
          <img
            src="/images/scenes/cinematic-01.png"
            alt="AI teacher delivering a structured classroom lesson with whiteboard, captions, and learner questions"
            className="cine-hero-image"
            loading="eager"
          />
        </CineReveal>
      </div>
    </section>
  );
}
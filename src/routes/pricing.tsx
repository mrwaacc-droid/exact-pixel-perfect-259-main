import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Building2, Headphones, Layers3, ShieldCheck, Users } from "lucide-react";
import { InfoPage } from "@/components/marketing/InfoPage";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing | AI Teaching Platform Plans for Schools and Universities | Klassruum" },
      {
        name: "description",
        content:
          "Explore Klassruum pricing for schools, universities, pilots, phased rollouts, support options, governance needs, and AI classroom deployment scope.",
      },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Pricing"
      title="Pricing built around institutional rollout"
      intro="Klassruum pricing is shaped around deployment scope, learner volume, support expectations, accessibility requirements, and how broadly your institution wants to use AI classroom delivery."
      cta={{ label: "Request a pricing conversation", to: "/contact" }}
      sections={[
        {
          icon: <Building2 size={20} />,
          title: "Institution-scale planning",
          body: "Pricing reflects organisational size, number of programmes, and the learner groups that need access.",
        },
        {
          icon: <Layers3 size={20} />,
          title: "Pilot to phased rollout",
          body: "Teams can start with a smaller controlled deployment and expand once the teaching model is validated.",
        },
        {
          icon: <Users size={20} />,
          title: "Role-based usage",
          body: "Different institution structures may need teacher, learner, admin, or oversight workflows in the same environment.",
        },
        {
          icon: <Headphones size={20} />,
          title: "Support and onboarding",
          body: "Support expectations, training, and rollout guidance can all influence the right package shape.",
        },
        {
          icon: <BarChart3 size={20} />,
          title: "Reporting and evidence needs",
          body: "Programmes with stronger review, tracking, or governance requirements can scope that into pricing discussions early.",
        },
        {
          icon: <ShieldCheck size={20} />,
          title: "Compliance and procurement context",
          body: "Accessibility, policy review, and procurement complexity can be factored into the conversation from the start.",
        },
      ]}
    >
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="lp-premium-card p-6 sm:p-8">
          <h2 className="text-heading text-2xl font-extrabold">How pricing is usually discussed</h2>
          <div className="text-body mt-4 space-y-4 text-sm leading-8 sm:text-base">
            <p>
              Institutions rarely need a one-size-fits-all software price. They need clarity on what
              happens at pilot stage, what happens at wider rollout, and what support or oversight is
              included as adoption grows.
            </p>
            <p>
              Klassruum pricing conversations are designed to map the platform to real delivery plans,
              not just to a list of features. That helps education teams scope value against teaching,
              accessibility, and reporting priorities.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Pilot", "A focused starting point for one programme, department, or use case."],
            ["Institution rollout", "A broader deployment across multiple courses, teams, or learner groups."],
            ["Custom scope", "For organisations that need staged adoption, reporting alignment, or implementation planning."],
          ].map(([title, body]) => (
            <div key={title} className="lp-premium-card p-6">
              <h3 className="text-heading text-lg font-bold">{title}</h3>
              <p className="text-body mt-2 text-sm leading-7">{body}</p>
            </div>
          ))}
          <div className="md:col-span-3 lp-premium-card p-6">
            <p className="text-body text-sm leading-8">
              Want the visual price teaser? Visit the{" "}
              <a href="/#pricing" className="text-learning-blue hover:text-academic-blue">
                landing page pricing section
              </a>{" "}
              or contact the team for a rollout-focused discussion.
            </p>
          </div>
        </div>
      </section>
    </InfoPage>
  ),
});

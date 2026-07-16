import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/marketing/InfoPage";
import { Clapperboard, Pen, Accessibility } from "lucide-react";

export const Route = createFileRoute("/webinars")({
  head: () => ({
    meta: [
      { title: "Webinars — Klassruum" },
      {
        name: "description",
        content:
          "Live and recorded sessions on getting the most out of Klassruum for your institution.",
      },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Webinars"
      title="Learn Klassruum, live"
      intro="Join our team for practical sessions on launching Klassruum, authoring great lessons, and making learning accessible — with time for your questions."
      cta={{ label: "Request an invite", to: "/contact" }}
      sections={[
        {
          icon: <Clapperboard size={20} />,
          title: "Getting started live",
          body: "A guided walkthrough of setting up your institution and first course.",
        },
        {
          icon: <Pen size={20} />,
          title: "Authoring masterclass",
          body: "How to turn your materials into lessons that teach well.",
        },
        {
          icon: <Accessibility size={20} />,
          title: "Accessibility deep dive",
          body: "Configuring learning modes and inclusive settings for diverse cohorts.",
        },
      ]}
    >
      <div className="rounded-2xl border border-dashed border-[#D8CCC6] bg-[var(--page-background)] p-8 text-center">
        <p className="text-sm font-medium text-[var(--muted)]">No sessions are scheduled just yet.</p>
        <p className="mt-1 text-sm text-[#8A7478]">
          Tell us what you'd like covered and we'll invite you to the next one.
        </p>
      </div>
    </InfoPage>
  ),
});

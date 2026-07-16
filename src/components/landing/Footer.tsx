import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { openCookieSettings } from "@/lib/cookie-consent";

type FooterLink =
  | { label: string; to: string; href?: undefined; onClick?: undefined }
  | { label: string; href: string; to?: undefined; onClick?: undefined }
  | { label: string; onClick: () => void; to?: undefined; href?: undefined };

export function Footer() {
  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: "Platform",
      links: [
        { label: "Classroom demo", to: "/demo/classroom" },
        { label: "How it works", href: "#how-it-works" },
        { label: "Accessibility", href: "#accessibility" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "For You",
      links: [
        { label: "For Learners", href: "#roles" },
        { label: "For Teachers", href: "#roles" },
        { label: "For Institutions", href: "#institutions" },
        { label: "For Parents", href: "#roles" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { label: "Schools", to: "/solutions/schools" },
        { label: "Universities", to: "/solutions/universities" },
        { label: "Training", to: "/solutions/training-providers" },
        { label: "NGOs", to: "/solutions/ngos" },
        { label: "Online Academies", to: "/solutions/online-academies" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy policy", to: "/privacy" },
        { label: "Terms of service", to: "/terms" },
        { label: "Cookie settings", onClick: openCookieSettings },
        { label: "Cookie policy", to: "/cookie-policy" },
      ],
    },
  ];

  return (
    <footer className="cine-footer">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(240px,1.2fr)_minmax(0,2.8fr)]">
          <div className="max-w-sm">
            <Link to="/" className="mb-5 flex items-center" aria-label="Klassruum home">
              <Logo size={34} variant="default" />
            </Link>
            <p className="text-[13px] leading-[1.7] text-white/55">
              Structured AI classroom delivery for institutions that need consistent teaching, accessibility, and evidence of learning.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="cine-footer-heading">{col.title}</h4>
                <ul className="grid gap-2.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link to={link.to as any} className="cine-footer-link">
                          {link.label}
                        </Link>
                      ) : link.href ? (
                        <a href={link.href} className="cine-footer-link">
                          {link.label}
                        </a>
                      ) : (
                        <button
                          onClick={link.onClick}
                          className="cursor-pointer border-none bg-transparent p-0 text-left cine-footer-link"
                        >
                          {link.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-[12px] text-white/40 md:flex-row md:items-center">
          <div>
            &copy; {new Date().getFullYear()} Klassruum Technologies. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-5">
            <Link to="/privacy" className="cine-footer-link">
              Privacy
            </Link>
            <Link to="/terms" className="cine-footer-link">
              Terms
            </Link>
            <button
              onClick={openCookieSettings}
              className="cursor-pointer border-none bg-transparent p-0 cine-footer-link"
            >
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
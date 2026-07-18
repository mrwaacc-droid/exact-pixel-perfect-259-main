import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  link?: string;
  linkText?: string;
  color: "blue" | "green" | "orange" | "purple" | "red" | "cyan";
  icon: ReactNode;
}

const colorClasses = {
  blue: { bg: "bg-[var(--crimson-soft)]", text: "text-[var(--crimson)]", icon: "bg-[var(--crimson-soft)]" },
  green: { bg: "bg-green-50", text: "text-green-600", icon: "bg-green-100" },
  orange: { bg: "bg-orange-50", text: "text-orange-600", icon: "bg-orange-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "bg-purple-100" },
  red: { bg: "bg-red-50", text: "text-red-600", icon: "bg-red-100" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-600", icon: "bg-cyan-100" },
};

export function StatCard({ title, value, subtitle, link, linkText, color, icon }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="stat-card">
      <div className={`stat-icon ${colors.icon} ${colors.text}`}>{icon}</div>
      <div className="stat-label">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{subtitle}</div>
      {link && (
        <a href={link} className={`stat-link ${colors.text}`}>
          {linkText || "View details"} <ArrowRight size={12} />
        </a>
      )}
    </div>
  );
}

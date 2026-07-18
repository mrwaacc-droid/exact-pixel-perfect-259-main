import { Link } from "@tanstack/react-router";
import { Play, Clock, CheckCircle } from "lucide-react";
import type { SessionCardData } from "@/lib/types";

interface RecentSessionCardProps {
  session: SessionCardData;
}

export function RecentSessionCard({ session }: RecentSessionCardProps) {
  const statusColors = {
    completed: "text-green-600 bg-green-50",
    in_progress: "text-[var(--crimson)] bg-[var(--crimson-soft)]",
    scheduled: "text-orange-600 bg-orange-50",
  };

  return (
    <Link to={`/classroom/session/${session.id}` as any} className="block">
      <div className="session-item">
        <div className="session-thumb">{session.thumbnail || <Play size={20} />}</div>
        <div className="session-info">
          <div className="session-name">{session.title}</div>
          <div className="session-class">{session.courseTitle}</div>
          <div className="session-meta">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {session.duration}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle size={12} className="text-green-500" />
              {session.timestamp}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

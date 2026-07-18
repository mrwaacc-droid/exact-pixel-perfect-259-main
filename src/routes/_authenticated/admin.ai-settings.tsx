import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PlatformAdminSectionPage } from "@/components/dashboard/platform/PlatformAdminSectionPage";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { getPlatformAiSettings } from "@/lib/admin.functions";
import { requirePlatformAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/admin/ai-settings")({
  beforeLoad: (ctx) => requirePlatformAdmin(ctx.context),
  component: AdminAiSettingsPage,
  head: () => ({
    meta: [
      { title: "AI Settings — Platform Admin" },
      { name: "description", content: "Configure AI providers and generation defaults" },
    ],
  }),
});

function AdminAiSettingsPage() {
  const fn = useServerFn(getPlatformAiSettings);
  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-ai-settings"],
    queryFn: () => fn(),
  });

  return (
    <PlatformAdminSectionPage
      activePath="/admin/ai-settings"
      title="AI Settings"
      label="Runtime configuration"
      subtitle="Read-only view of the AI providers and defaults configured via environment variables."
      loading={isLoading}
      error={(error as Error | null)?.message ?? null}
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gray-500)]">
            Default provider
          </p>
          <p className="mt-2 text-lg font-bold capitalize text-[var(--gray-900)]">
            {data?.defaultProvider ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gray-500)]">
            Max tokens
          </p>
          <p className="mt-2 text-lg font-bold text-[var(--gray-900)]">{data?.maxTokens ?? "—"}</p>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--gray-200)] bg-white">
        <div className="border-b border-[var(--gray-200)] bg-[var(--gray-50)] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">
          Providers
        </div>
        <div className="divide-y divide-[var(--gray-100)]">
          {(data?.providers ?? []).map((p) => (
            <div key={p.name} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-semibold text-[var(--gray-900)]">{p.name}</p>
                <p className="text-xs text-[var(--gray-500)]">
                  {p.model} · {p.baseUrl}
                </p>
              </div>
              <StatusBadge variant={p.configured ? "success" : "neutral"}>
                {p.configured ? "Configured" : "Not configured"}
              </StatusBadge>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--gray-200)] bg-white">
        <div className="border-b border-[var(--gray-200)] bg-[var(--gray-50)] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">
          Teacher voice
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-semibold text-[var(--gray-900)]">
              {data?.teacherVoice.provider} · {data?.teacherVoice.voice}
            </p>
            <p className="text-xs text-[var(--gray-500)]">Text-to-speech for AI teacher responses</p>
          </div>
          <StatusBadge variant={data?.teacherVoice.enabled ? "success" : "neutral"}>
            {data?.teacherVoice.enabled ? "Enabled" : "Disabled"}
          </StatusBadge>
        </div>
      </div>
    </PlatformAdminSectionPage>
  );
}

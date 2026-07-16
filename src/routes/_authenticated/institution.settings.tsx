import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyInstitutions } from "@/lib/institutions.functions";
import { requireInstitutionAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/settings")({
  beforeLoad: (ctx) => requireInstitutionAdmin(ctx.context),
  component: SettingsPage,
});

function SettingsPage() {
  const myFn = useServerFn(getMyInstitutions);
  const { data, isLoading } = useQuery({ queryKey: ["my-institutions"], queryFn: () => myFn() });
  const inst = data?.memberships?.[0]?.institution;

  return (
    <InstitutionShell title="Settings">
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !inst ? (
        <p className="text-muted-foreground">No institution.</p>
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Institution profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Name" value={inst.name} />
            <Row label="Type" value={inst.type} />
            <Row
              label="Location"
              value={`${inst.city ?? ""}${inst.country ? `, ${inst.country}` : ""}`}
            />
            <Row label="Contact email" value={inst.contact_email ?? "—"} />
            <Row label="Phone" value={inst.phone ?? "—"} />
            <Row label="Status" value={inst.status} />
            <p className="pt-4 text-xs text-muted-foreground">
              Keep these institution details aligned with billing, teacher access, and learner enrollment records.
            </p>
          </CardContent>
        </Card>
      )}
    </InstitutionShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/50 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}

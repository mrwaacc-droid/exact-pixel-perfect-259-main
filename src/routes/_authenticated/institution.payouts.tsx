import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  BadgeCheck,
  Clock,
  Loader2,
  RefreshCw,
  Wallet,
  CheckCircle2,
  Search,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  listTeacherPayouts,
  markPayoutPaid,
} from "@/lib/payouts-rentals.functions";
import { fmtMoney } from "@/lib/payouts-rentals.functions";
import { requireClientAuthRoute } from "@/lib/route-guards";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/institution/payouts")({
  beforeLoad: () => requireClientAuthRoute(),
  component: InstitutionPayoutsPage,
});

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  processing: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

function InstitutionPayoutsPage() {
  const listFn = useServerFn(listTeacherPayouts);
  const markPaidFn = useServerFn(markPayoutPaid);
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [search, setSearch] = useState("");
  const [markingId, setMarkingId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["payouts", statusFilter],
    queryFn: () => listFn({ data: { status: statusFilter } }),
  });

  const markPaid = useMutation({
    mutationFn: async (payoutId: string) => {
      setMarkingId(payoutId);
      return markPaidFn({ data: { payout_id: payoutId } });
    },
    onSuccess: () => {
      toast.success("Payout marked as paid");
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      setMarkingId(null);
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to mark payout");
      setMarkingId(null);
    },
  });

  const payouts = query.data?.payouts ?? [];
  const filtered = search.trim()
    ? payouts.filter((p: any) =>
        (p.teacher_id ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : payouts;

  // Aggregate stats
  const totalPending = payouts
    .filter((p: any) => p.status === "pending")
    .reduce((sum: number, p: any) => sum + (p.amount_cents ?? 0), 0);
  const totalPaid = payouts
    .filter((p: any) => p.status === "paid")
    .reduce((sum: number, p: any) => sum + (p.amount_cents ?? 0), 0);

  return (
    <DashboardShell
      config={dashboardConfigs.institution}
      activePath="/institution/payouts"
      title="Teacher Payouts"
      subtitle="Track and manage compensation owed to teachers for sessions taught."
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6B7280]">Pending Payouts</p>
                <p className="text-xl font-black text-[#221C1D]">
                  {fmtMoney(totalPending)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <BadgeCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6B7280]">Total Paid</p>
                <p className="text-xl font-black text-[#221C1D]">
                  {fmtMoney(totalPaid)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {["pending", "processing", "paid", "failed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize transition ${
                  statusFilter === s
                    ? "bg-[var(--crimson)] text-white"
                    : "bg-white text-[#6B7280] hover:bg-[#EAF8F7]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by teacher ID..."
              className="pl-9 w-64"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Loading */}
        {query.isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--crimson)]" />
          </div>
        )}

        {/* Empty */}
        {!query.isLoading && filtered.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF8F7]">
                <Wallet className="h-7 w-7 text-[var(--crimson)]" />
              </div>
              <h3 className="text-lg font-black text-[#221C1D]">No {statusFilter} payouts</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[#6B7280]">
                When teachers complete sessions, their payouts will appear here.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Payouts table */}
        {!query.isLoading && filtered.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#FBF8F5] text-left text-xs font-bold uppercase text-[#6B7280]">
                      <th className="px-5 py-3">Teacher</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Sessions</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((payout: any) => (
                      <tr key={payout.id} className="border-b border-[#F3F0ED] last:border-0">
                        <td className="px-5 py-4 font-mono text-xs text-[#4B5563]">
                          {payout.teacher_id?.slice(0, 8)}…
                        </td>
                        <td className="px-5 py-4 font-bold text-[#221C1D]">
                          {fmtMoney(payout.amount_cents, payout.currency)}
                        </td>
                        <td className="px-5 py-4 text-[#6B7280]">{payout.session_count}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                              STATUS_STYLES[payout.status] ?? "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-[#6B7280]">
                          {payout.paid_at
                            ? new Date(payout.paid_at).toLocaleDateString()
                            : new Date(payout.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {payout.status === "pending" || payout.status === "processing" ? (
                            <Button
                              size="sm"
                              className="bg-[var(--crimson)] hover:bg-[var(--crimson-dark)]"
                              disabled={markingId === payout.id}
                              onClick={() => markPaid.mutate(payout.id)}
                            >
                              {markingId === payout.id ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                              )}
                              Mark Paid
                            </Button>
                          ) : (
                            <span className="text-xs text-[#9CA3AF]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
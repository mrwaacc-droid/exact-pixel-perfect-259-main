import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  CalendarDays,
  CheckCircle2,
  DoorOpen,
  Loader2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  checkClassroomAvailability,
  createClassroomRental,
  initializeRentalCheckout,
  listClassroomRentals,
  verifyRentalPayment,
  fmtMoney,
} from "@/lib/payouts-rentals.functions";
import { listClassrooms } from "@/lib/classrooms.functions";
import { getMyInstitutions } from "@/lib/institutions.functions";

type RentalsRole = "institution" | "teacher";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-[#F7E7EA] text-[#7D2233]",
  active: "bg-emerald-50 text-emerald-700",
  completed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-50 text-red-700",
};

const RENTAL_TYPE_LABELS: Record<string, string> = {
  per_session: "Per session",
  hourly: "Hourly",
  daily: "Daily",
  monthly: "Monthly",
};

function toIso(local: string): string | null {
  if (!local) return null;
  const date = new Date(local);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function RentalsWorkspace({ role }: { role: RentalsRole }) {
  const returnPath = role === "institution" ? "/institution/rentals" : "/teacher/rentals";
  const config =
    role === "institution" ? dashboardConfigs.institution : dashboardConfigs.teacher;

  const queryClient = useQueryClient();
  const listFn = useServerFn(listClassroomRentals);
  const listClassroomsFn = useServerFn(listClassrooms);
  const myInstitutionsFn = useServerFn(getMyInstitutions);
  const availabilityFn = useServerFn(checkClassroomAvailability);
  const createRentalFn = useServerFn(createClassroomRental);
  const initCheckoutFn = useServerFn(initializeRentalCheckout);
  const verifyFn = useServerFn(verifyRentalPayment);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Booking form state
  const [institutionId, setInstitutionId] = useState<string>("");
  const [classroomId, setClassroomId] = useState<string>("");
  const [rentalType, setRentalType] = useState<string>("per_session");
  const [startAt, setStartAt] = useState<string>("");
  const [endAt, setEndAt] = useState<string>("");

  const rentalsQuery = useQuery({
    queryKey: ["rentals", role, statusFilter],
    queryFn: () => listFn({ data: statusFilter ? { status: statusFilter } : {} }),
  });

  const institutionsQuery = useQuery({
    queryKey: ["my-institutions"],
    queryFn: () => myInstitutionsFn(),
  });

  const institutions = useMemo(
    () =>
      (institutionsQuery.data?.memberships ?? [])
        .map((m: any) => m.institution)
        .filter(Boolean),
    [institutionsQuery.data],
  );

  useEffect(() => {
    if (!institutionId && institutions.length > 0) {
      setInstitutionId(institutions[0].id);
    }
  }, [institutions, institutionId]);

  const classroomsQuery = useQuery({
    queryKey: ["classrooms", institutionId],
    queryFn: () => listClassroomsFn({ data: { institution_id: institutionId } }),
    enabled: Boolean(institutionId),
  });
  const classrooms = classroomsQuery.data?.classrooms ?? [];

  const startIso = toIso(startAt);
  const endIso = toIso(endAt);
  const windowValid = Boolean(startIso && endIso && startIso < endIso);

  const quoteQuery = useQuery({
    queryKey: ["rental-quote", classroomId, rentalType, startIso, endIso],
    queryFn: () =>
      availabilityFn({
        data: {
          virtual_classroom_id: classroomId,
          start_at: startIso as string,
          end_at: endIso as string,
          rental_type: rentalType as any,
        },
      }),
    enabled: Boolean(classroomId) && windowValid,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!windowValid) throw new Error("Choose a valid start and end time.");
      const created = await createRentalFn({
        data: {
          virtual_classroom_id: classroomId,
          institution_id: institutionId,
          rental_type: rentalType as any,
          start_at: startIso as string,
          end_at: endIso as string,
        },
      });
      const rental = (created as any)?.rental;
      if (!rental?.id) throw new Error("Could not create the rental.");
      const checkout = await initCheckoutFn({
        data: { rental_id: rental.id, return_path: returnPath as any },
      });
      return checkout as { authorizationUrl: string };
    },
    onSuccess: (checkout) => {
      window.location.assign(checkout.authorizationUrl);
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Could not start the rental payment.");
    },
  });

  // Handle Paystack return: ?reference=...&rental_id=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    const rentalId = params.get("rental_id");
    if (!reference || !rentalId) return;

    window.history.replaceState({}, "", window.location.pathname);
    verifyFn({ data: { rental_id: rentalId, reference } })
      .then((result: any) => {
        if (result?.ok) {
          toast.success("Payment confirmed. Your classroom rental is booked.");
        } else {
          toast.error(
            `Payment ${result?.status ?? "failed"}. The rental was not confirmed.`,
          );
        }
      })
      .catch((error: any) => {
        toast.error(error?.message ?? "Could not verify the rental payment.");
      })
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: ["rentals"] });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rentals = rentalsQuery.data?.rentals ?? [];
  const filtered = search.trim()
    ? rentals.filter((r: any) => {
        const q = search.toLowerCase();
        const classroomName = r.virtual_classrooms?.name ?? "";
        return (
          classroomName.toLowerCase().includes(q) ||
          (r.rental_type ?? "").toLowerCase().includes(q)
        );
      })
    : rentals;

  const totalSpend = rentals
    .filter((r: any) => ["confirmed", "active", "completed"].includes(r.status))
    .reduce((sum: number, r: any) => sum + (r.amount_cents ?? 0), 0);
  const activeCount = rentals.filter((r: any) =>
    ["confirmed", "active"].includes(r.status),
  ).length;

  const quote = quoteQuery.data as
    | { available: boolean; price_cents: number; currency?: string }
    | undefined;

  return (
    <DashboardShell
      config={config}
      activePath={returnPath}
      title="Classroom Rentals"
      subtitle="Rent virtual classroom space by the session, hour, day, or month."
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <DoorOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Active Bookings</p>
                <p className="text-xl font-black text-heading">{activeCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7E7EA]">
                <CheckCircle2 className="h-6 w-6 text-[var(--crimson)]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Total Rental Spend</p>
                <p className="text-xl font-black text-heading">{fmtMoney(totalSpend)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                statusFilter === ""
                  ? "bg-[var(--crimson)] text-white"
                  : "bg-white text-muted-foreground hover:bg-[#F7E7EA]"
              }`}
            >
              All
            </button>
            {["pending", "confirmed", "active", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize transition ${
                  statusFilter === s
                    ? "bg-[var(--crimson)] text-white"
                    : "bg-white text-muted-foreground hover:bg-[#F7E7EA]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by classroom..."
                className="w-56 pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => rentalsQuery.refetch()}
              disabled={rentalsQuery.isFetching}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${rentalsQuery.isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setIsBookingOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Rent a Classroom
            </Button>
          </div>
        </div>

        {/* Loading */}
        {rentalsQuery.isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--crimson)]" />
          </div>
        )}

        {/* Empty */}
        {!rentalsQuery.isLoading && filtered.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F7E7EA]">
                <CalendarDays className="h-7 w-7 text-[var(--crimson)]" />
              </div>
              <h3 className="text-lg font-black text-heading">No rentals yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Rent a virtual classroom to host sessions. Choose from per-session, hourly,
                daily, or monthly plans.
              </p>
              <Button className="mt-5" onClick={() => setIsBookingOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Rent a Classroom
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Rentals table */}
        {!rentalsQuery.isLoading && filtered.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-[var(--page-background)] text-left text-xs font-bold uppercase text-muted-foreground">
                      <th className="px-5 py-3">Classroom</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Window</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Payment Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((rental: any) => {
                      const vcName = Array.isArray(rental.virtual_classrooms)
                        ? rental.virtual_classrooms[0]?.name
                        : (rental.virtual_classrooms?.name ?? "Classroom");
                      return (
                        <tr key={rental.id} className="border-b border-border-soft last:border-0">
                          <td className="px-5 py-4 font-bold text-heading">{vcName}</td>
                          <td className="px-5 py-4 capitalize text-muted-foreground">
                            {rental.rental_type?.replace("_", " ")}
                          </td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {new Date(rental.start_at).toLocaleDateString()} →{" "}
                              {new Date(rental.end_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-bold text-heading">
                            {fmtMoney(rental.amount_cents, rental.currency)}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                                STATUS_STYLES[rental.status] ?? "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {rental.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                            {rental.paystack_reference ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rent a Classroom</DialogTitle>
            <DialogDescription>
              Pick a classroom and a time window. You will be taken to Paystack to complete
              payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {institutions.length > 1 && (
              <div className="space-y-1.5">
                <Label>Institution</Label>
                <Select value={institutionId} onValueChange={setInstitutionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((inst: any) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Classroom</Label>
              <Select value={classroomId} onValueChange={setClassroomId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      classroomsQuery.isLoading
                        ? "Loading classrooms..."
                        : classrooms.length === 0
                          ? "No classrooms available"
                          : "Choose a classroom"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((room: any) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                      {room.capacity ? ` · ${room.capacity} seats` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Billing type</Label>
              <Select value={rentalType} onValueChange={setRentalType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RENTAL_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rental-start">Starts</Label>
                <Input
                  id="rental-start"
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rental-end">Ends</Label>
                <Input
                  id="rental-end"
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                />
              </div>
            </div>

            {startAt && endAt && !windowValid && (
              <p className="text-xs font-semibold text-destructive">
                The end time must be after the start time.
              </p>
            )}

            {quoteQuery.isFetching && (
              <p className="text-xs text-muted-foreground">Checking availability…</p>
            )}
            {quote && windowValid && (
              <div
                className={`rounded-lg border p-3 text-sm ${
                  quote.available
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {quote.available ? (
                  <>
                    Available — total{" "}
                    <strong>{fmtMoney(quote.price_cents, quote.currency ?? "KES")}</strong>
                  </>
                ) : (
                  "This classroom is already booked for the selected time."
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => bookMutation.mutate()}
              disabled={
                bookMutation.isPending ||
                !classroomId ||
                !institutionId ||
                !windowValid ||
                (quote ? !quote.available : false)
              }
            >
              {bookMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting payment…
                </>
              ) : (
                "Proceed to payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

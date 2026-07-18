import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, GraduationCap, Mail, Plus, RefreshCcw, UserPlus, Users } from "lucide-react";
import { requireInstitutionStaff } from "@/lib/route-guards";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listInstitutionStudents } from "@/lib/institution-invites.functions";

type StudentRow = {
  userId: string;
  fullName: string | null;
  email: string | null;
  status: string;
  joinedAt: string | null;
  enrolledCourses: number;
};

export const Route = createFileRoute("/_authenticated/institution/students")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: InstitutionStudentsRoute,
});

function formatDate(input?: string | null) {
  if (!input) return "—";
  return new Date(input).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function InstitutionStudentsRoute() {
  const routeContext = Route.useRouteContext() as Record<string, unknown>;
  const institutionId = (routeContext.institutionId as string | null) ?? "demo-institution";

  const listFn = useServerFn(listInstitutionStudents);
  const query = useQuery({
    queryKey: ["institution-students", institutionId],
    queryFn: () => listFn({ data: { institution_id: institutionId } }),
    enabled: Boolean(institutionId),
  });

  const students = (query.data?.students ?? []) as StudentRow[];
  const pendingInvites = query.data?.pendingInvites ?? [];
  const stats = query.data?.stats ?? { activeStudents: 0, pendingInvites: 0, enrolled: 0 };

  return (
    <InstitutionShell
      title="Students"
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button asChild size="sm">
            <Link to="/institution/students/invite">
              <UserPlus className="mr-2 h-4 w-4" /> Invite student
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={GraduationCap} label="Active students" value={stats.activeStudents} />
        <StatCard icon={Mail} label="Pending invites" value={stats.pendingInvites} />
        <StatCard icon={BookOpen} label="Enrolled in a course" value={stats.enrolled} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Institution student roster
            </CardTitle>
          </CardHeader>
          <CardContent>
            {query.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading students…</p>
            ) : students.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Enrolled courses</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.userId}>
                      <TableCell>
                        <div className="font-medium">{student.fullName ?? student.email ?? "Student"}</div>
                        <div className="text-xs text-muted-foreground">
                          {student.email ?? "No email on profile"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.enrolledCourses > 0 ? "secondary" : "outline"}>
                          {student.enrolledCourses} course{student.enrolledCourses === 1 ? "" : "s"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(student.joinedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold">No active students yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Invite students to join the institution, then enroll them into courses from the
                  course's Enrollments tab.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/institution/students/invite">
                    <Plus className="mr-2 h-4 w-4" /> Invite your first student
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> Pending student invites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingInvites.length ? (
              pendingInvites.map((invite: any) => (
                <div key={invite.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{invite.full_name ?? invite.email}</div>
                      <div className="text-xs text-muted-foreground">{invite.email}</div>
                    </div>
                    <Badge variant="outline">{invite.status}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Expires {formatDate(invite.expires_at)}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                No pending student invitations. New invites will appear here until accepted.
              </div>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link to="/institution/students/invite">
                <UserPlus className="mr-2 h-4 w-4" /> Send another invite
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </InstitutionShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

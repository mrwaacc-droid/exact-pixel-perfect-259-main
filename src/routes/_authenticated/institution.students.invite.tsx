import { FormEvent, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Copy, Mail, Send, UserPlus } from "lucide-react";
import { requireInstitutionAdmin } from "@/lib/route-guards";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createInstitutionInvite } from "@/lib/institution-invites.functions";

export const Route = createFileRoute("/_authenticated/institution/students/invite")({
  beforeLoad: (ctx) => requireInstitutionAdmin(ctx.context),
  component: InviteStudentRoute,
});

function InviteStudentRoute() {
  const routeContext = Route.useRouteContext() as Record<string, unknown>;
  const institutionId = (routeContext.institutionId as string | null) ?? "demo-institution";
  const router = useRouter();
  const inviteFn = useServerFn(createInstitutionInvite);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    "You have been invited to join Klassruum as a student. Please accept this invite to get started.",
  );
  const [expiresInDays, setExpiresInDays] = useState(14);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      inviteFn({
        data: {
          institution_id: institutionId,
          email,
          full_name: fullName || undefined,
          role: "student",
          message: message || undefined,
          expires_in_days: expiresInDays,
        },
      }),
    onSuccess: (result) => {
      setInviteUrl(result.invite_url);
      toast.success("Student invite created and queued for email delivery.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviteUrl(null);
    mutation.mutate();
  };

  const copyInviteUrl = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied.");
  };

  return (
    <InstitutionShell
      title="Invite student"
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link to="/institution/students">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to students
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Invite a student
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={submit}>
              <div className="grid gap-2">
                <Label htmlFor="full-name">Student name</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="e.g. Amina Okafor"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Student email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="student@example.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expires">Invite expiry</Label>
                <Input
                  id="expires"
                  type="number"
                  min={1}
                  max={90}
                  value={expiresInDays}
                  onChange={(event) => setExpiresInDays(Number(event.target.value) || 14)}
                />
                <p className="text-xs text-muted-foreground">
                  The invite can be valid for 1 to 90 days.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  placeholder="Add welcome instructions or context for this student."
                />
              </div>

              <Button type="submit" disabled={mutation.isPending || !email}>
                <Send className="mr-2 h-4 w-4" />
                {mutation.isPending ? "Creating invite…" : "Send student invite"}
              </Button>
            </form>

            {inviteUrl ? (
              <Alert className="mt-6">
                <Mail className="h-4 w-4" />
                <AlertTitle>Invite ready</AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>
                    The invite has been created and an outbound email job has been queued. You can
                    also copy this link and share it directly with the student.
                  </p>
                  <div className="flex gap-2">
                    <Input value={inviteUrl} readOnly />
                    <Button type="button" variant="outline" onClick={copyInviteUrl}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.navigate({ to: "/institution/students" })}
                  >
                    View students
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              The student receives an invite link, signs in or creates an account, and becomes an
              active member of your institution after accepting.
            </p>
            <p>
              Once accepted, go to a course's Enrollments tab to enroll them — or ask them to enroll
              themselves from the course catalog.
            </p>
            <p>
              Invites are tracked in the pending invite panel until accepted, revoked, or expired.
            </p>
          </CardContent>
        </Card>
      </div>
    </InstitutionShell>
  );
}

import { FormEvent, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Layers } from "lucide-react";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getMyInstitutions } from "@/lib/institutions.functions";
import { createProgramme } from "@/lib/programmes.functions";
import { requireInstitutionStaff } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/programmes/new")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: NewProgrammePage,
});

function NewProgrammePage() {
  const navigate = useNavigate();
  const myFn = useServerFn(getMyInstitutions);
  const my = useQuery({ queryKey: ["my-institutions"], queryFn: () => myFn() });
  const institutionId = my.data?.memberships?.[0]?.institution?.id;

  const createFn = useServerFn(createProgramme);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectArea, setSubjectArea] = useState("");
  const [level, setLevel] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          institution_id: institutionId!,
          title,
          description: description || undefined,
          subject_area: subjectArea || undefined,
          level: level || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Programme created.");
      navigate({ to: "/institution/programmes" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!institutionId) return;
    mutation.mutate();
  };

  return (
    <InstitutionShell
      title="Create Programme"
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link to="/institution/programmes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to programmes
          </Link>
        </Button>
      }
    >
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" /> New academic programme
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!institutionId ? (
            <p className="text-sm text-muted-foreground">No institution found for your account.</p>
          ) : (
            <form className="space-y-5" onSubmit={submit}>
              <div className="grid gap-2">
                <Label htmlFor="title">Programme title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grade 9 Kenyan CBC Mathematics"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="What does this programme cover?"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="subject-area">Subject area</Label>
                  <Input
                    id="subject-area"
                    value={subjectArea}
                    onChange={(e) => setSubjectArea(e.target.value)}
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="level">Level</Label>
                  <Input
                    id="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    placeholder="e.g. Grade 9"
                  />
                </div>
              </div>

              <Button type="submit" disabled={mutation.isPending || !title}>
                {mutation.isPending ? "Creating…" : "Create programme"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </InstitutionShell>
  );
}

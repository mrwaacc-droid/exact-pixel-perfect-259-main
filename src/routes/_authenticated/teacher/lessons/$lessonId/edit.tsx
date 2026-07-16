import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, X, Save, Loader2, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { requireInstitutionStaff } from "@/lib/route-guards";
import { getTeacherLessonWorkspace } from "@/lib/teacher-course-workspace";
import {
  getLesson,
  updateLessonDetails,
  updateLessonSection,
  updateTeachingItem,
  deleteTeachingItem,
  publishLesson,
} from "@/lib/lessons.functions";

export const Route = createFileRoute("/_authenticated/teacher/lessons/$lessonId/edit")({
  beforeLoad: (ctx) => requireInstitutionStaff(ctx.context),
  component: LessonEditorPage,
});

function LessonEditorPage() {
  const { lessonId } = Route.useParams();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const isUuidLesson =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(lessonId);
  const demoLesson = !isUuidLesson ? getTeacherLessonWorkspace(lessonId) : null;

  const fn = useServerFn(getLesson);
  const q = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => fn({ data: { lesson_id: lessonId } }),
    enabled: isUuidLesson,
  });

  if (demoLesson) {
    return <DemoLessonEditor lessonId={lessonId} demo={demoLesson} />;
  }

  if (isUuidLesson && q.isLoading) {
    return (
      <InstitutionShell title="Lesson Editor">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </InstitutionShell>
    );
  }

  if (!q.data?.lesson) {
    return (
      <InstitutionShell title="Lesson Editor">
        <p className="text-muted-foreground">Lesson not found.</p>
      </InstitutionShell>
    );
  }

  const lesson = q.data.lesson as any;
  const sections = lesson.sections || [];

  return (
    <InstitutionShell
      title={lesson.title || "Edit Lesson"}
      actions={
        <Link to={"/institution/courses/$courseId"} params={{ courseId: lesson.course_id }}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to course
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Lesson Header */}
        <LessonHeader lesson={lesson} lessonId={lessonId} onRefresh={() => q.refetch()} />

        {/* Sections */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Lesson Sections</h3>
          {sections.length === 0 ? (
            <p className="text-muted-foreground">No sections in this lesson.</p>
          ) : (
            sections.map((section: any) => (
              <SectionAccordion
                key={section.id}
                section={section}
                isExpanded={expandedSections.has(section.id)}
                onToggle={(id) => {
                  const next = new Set(expandedSections);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  setExpandedSections(next);
                }}
                onUpdate={() => q.refetch()}
              />
            ))
          )}
        </div>

        {/* Publish Actions */}
        <PublishSection lesson={lesson} lessonId={lessonId} onPublish={() => {}} />
      </div>
    </InstitutionShell>
  );
}

function DemoLessonEditor({
  lessonId,
  demo,
}: {
  lessonId: string;
  demo: NonNullable<ReturnType<typeof getTeacherLessonWorkspace>>;
}) {
  const { course, lesson } = demo;
  const [form, setForm] = useState({
    title: lesson.title,
    objective: lesson.objective,
    duration: lesson.duration.replace(" min", ""),
    status: lesson.status,
  });
  const [saved, setSaved] = useState(false);

  return (
    <InstitutionShell
      title={form.title || "Edit Lesson"}
      actions={
        <Link to="/teacher/courses/$courseId/lessons" params={{ courseId: course.id }}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Course lessons
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lesson details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </div>
            <div>
              <Label>Objective</Label>
              <Textarea
                value={form.objective}
                onChange={(event) => setForm({ ...form, objective: event.target.value })}
                className="min-h-24"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={form.duration}
                  onChange={(event) => setForm({ ...form, duration: event.target.value })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Input
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value as typeof form.status })
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-[var(--crimson)] hover:bg-[var(--crimson-dark)]"
                onClick={() => {
                  setSaved(true);
                  toast.success("Demo lesson changes saved in this session");
                }}
              >
                <Save className="h-4 w-4" />
                Save lesson
              </Button>
              <Link to="/classroom/preview/$lessonId" params={{ lessonId }}>
                <Button variant="outline">
                  <BookOpen className="h-4 w-4" />
                  Preview lesson
                </Button>
              </Link>
            </div>
            {saved && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                Saved for this demo workspace. Real institution lessons continue to save through
                Supabase when their lesson ID is a UUID.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold">Teaching sequence</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              This demo lesson has {lesson.steps} classroom steps. Use the preview to test pacing,
              captions, narration, and the live classroom flow before recording.
            </p>
          </CardContent>
        </Card>
      </div>
    </InstitutionShell>
  );
}

function LessonHeader({
  lesson,
  lessonId,
  onRefresh,
}: {
  lesson: any;
  lessonId: string;
  onRefresh: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title: lesson.title || "",
    objective: lesson.objective || "",
    duration_minutes: lesson.duration_minutes || 35,
  });

  const qc = useQueryClient();
  const fn = useServerFn(updateLessonDetails);
  const m = useMutation({
    mutationFn: () =>
      fn({
        data: {
          lesson_id: lessonId,
          ...form,
        },
      }),
    onSuccess: () => {
      toast.success("Lesson details updated");
      setIsEditing(false);
      qc.invalidateQueries({ queryKey: ["lesson", lessonId] });
      onRefresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    maxLength={160}
                  />
                </div>
                <div>
                  <Label>Objective</Label>
                  <Textarea
                    value={form.objective}
                    onChange={(e) => setForm({ ...form, objective: e.target.value })}
                    maxLength={1000}
                    className="min-h-20"
                  />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) =>
                      setForm({ ...form, duration_minutes: parseInt(e.target.value) })
                    }
                    min={15}
                    max={600}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => m.mutate()} disabled={m.isPending}>
                    {m.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold">{lesson.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{lesson.objective}</p>
                <div className="mt-2 flex items-center gap-4">
                  <Badge variant="secondary">{lesson.status}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {lesson.duration_minutes || "?"} min
                  </span>
                </div>
              </div>
            )}
          </div>
          {!isEditing && (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}

function SectionAccordion({
  section,
  isExpanded,
  onToggle,
  onUpdate,
}: {
  section: any;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onUpdate: () => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [sectionTitle, setSectionTitle] = useState(section.title || "");

  const qc = useQueryClient();
  const updateSectionFn = useServerFn(updateLessonSection);
  const m = useMutation({
    mutationFn: () =>
      updateSectionFn({
        data: {
          section_id: section.id,
          title: sectionTitle,
        },
      }),
    onSuccess: () => {
      toast.success("Section updated");
      setIsEditingTitle(false);
      qc.invalidateQueries({ queryKey: ["lesson", section.lesson_id] });
      onUpdate();
    },
  });

  const items = section.teaching_items || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <button
              onClick={() => onToggle(section.id)}
              className="p-1 hover:bg-muted rounded transition flex-shrink-0"
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <div className="flex gap-2">
                  <Input
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    maxLength={255}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => m.mutate()} disabled={m.isPending}>
                    {m.isPending ? "..." : "Save"}
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded transition"
                >
                  <div>
                    <h4 className="font-semibold text-left">{section.title || "(Untitled)"}</h4>
                    <p className="text-xs text-muted-foreground">{section.type}</p>
                  </div>
                </button>
              )}
            </div>
          </div>
          <Badge variant="outline">{items.length} items</Badge>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3 pt-0 border-t">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3">No teaching items in this section.</p>
          ) : (
            items.map((item: any, idx: number) => (
              <TeachingItemEditor key={item.id} item={item} index={idx + 1} onUpdate={onUpdate} />
            ))
          )}
        </CardContent>
      )}
    </Card>
  );
}

function TeachingItemEditor({
  item,
  index,
  onUpdate,
}: {
  item: any;
  index: number;
  onUpdate: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    board_text: item.board_text || "",
    exact_spoken_text: item.exact_spoken_text || "",
    teacher_explanation: item.teacher_explanation || "",
    learner_notes: item.learner_notes || "",
    common_mistake: item.common_mistake || "",
  });

  const qc = useQueryClient();
  const updateFn = useServerFn(updateTeachingItem);
  const deleteFn = useServerFn(deleteTeachingItem);

  const m = useMutation({
    mutationFn: () =>
      updateFn({
        data: {
          item_id: item.id,
          ...form,
        },
      }),
    onSuccess: () => {
      toast.success("Item updated");
      setIsEditing(false);
      qc.invalidateQueries({ queryKey: ["lesson", item.lesson_id] });
      onUpdate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFn({ data: { item_id: item.id } }),
    onSuccess: () => {
      toast.success("Item deleted");
      qc.invalidateQueries({ queryKey: ["lesson", item.lesson_id] });
      onUpdate();
    },
  });

  if (isEditing) {
    return (
      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
        <h5 className="font-medium">Item {index}</h5>

        <div>
          <Label className="text-xs">Board Text (what learners see)</Label>
          <Textarea
            value={form.board_text}
            onChange={(e) => setForm({ ...form, board_text: e.target.value })}
            placeholder="What appears on the whiteboard (5-26 words)"
            maxLength={500}
            className="min-h-16"
          />
        </div>

        <div>
          <Label className="text-xs">Exact Spoken Text</Label>
          <Textarea
            value={form.exact_spoken_text}
            onChange={(e) => setForm({ ...form, exact_spoken_text: e.target.value })}
            placeholder="What the teacher reads exactly"
            maxLength={1000}
            className="min-h-16"
          />
        </div>

        <div>
          <Label className="text-xs">Detailed Explanation</Label>
          <Textarea
            value={form.teacher_explanation}
            onChange={(e) => setForm({ ...form, teacher_explanation: e.target.value })}
            placeholder="Deep narrative explanation"
            maxLength={2000}
            className="min-h-24"
          />
        </div>

        <div>
          <Label className="text-xs">Learner Notes</Label>
          <Textarea
            value={form.learner_notes}
            onChange={(e) => setForm({ ...form, learner_notes: e.target.value })}
            placeholder="What goes in the learner's notes"
            maxLength={1000}
            className="min-h-16"
          />
        </div>

        <div>
          <Label className="text-xs">Common Mistake</Label>
          <Textarea
            value={form.common_mistake}
            onChange={(e) => setForm({ ...form, common_mistake: e.target.value })}
            placeholder="Optional: a common wrong answer and the correction"
            maxLength={500}
            className="min-h-16"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={() => m.mutate()} disabled={m.isPending}>
            {m.isPending ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              if (confirm("Delete this item?")) deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-3 bg-card">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h5 className="font-medium text-sm">Item {index}</h5>
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      </div>

      <div className="grid gap-2 text-sm">
        {form.board_text && (
          <div>
            <span className="text-xs font-semibold text-muted-foreground">BOARD:</span>
            <p className="text-sm">{form.board_text}</p>
          </div>
        )}
        {form.exact_spoken_text && (
          <div>
            <span className="text-xs font-semibold text-muted-foreground">SPOKEN:</span>
            <p className="text-sm">{form.exact_spoken_text}</p>
          </div>
        )}
        {form.teacher_explanation && (
          <div>
            <span className="text-xs font-semibold text-muted-foreground">EXPLANATION:</span>
            <p className="text-sm line-clamp-2">{form.teacher_explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PublishSection({
  lesson,
  lessonId,
  onPublish,
}: {
  lesson: any;
  lessonId: string;
  onPublish: () => void;
}) {
  const qc = useQueryClient();
  const fn = useServerFn(publishLesson);
  const m = useMutation({
    mutationFn: () => fn({ data: { lesson_id: lessonId } }),
    onSuccess: () => {
      toast.success("Lesson published!");
      qc.invalidateQueries({ queryKey: ["lesson", lessonId] });
      setTimeout(() => onPublish(), 1500);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (lesson.status === "published") {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-900">Published</h4>
            <p className="text-sm text-green-800">This lesson is live and visible to students.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--crimson-soft)] bg-[var(--crimson-soft)]">
      <CardContent className="p-6">
        <h4 className="font-semibold mb-2 text-[#191314]">Ready to Publish?</h4>
        <p className="text-sm text-[var(--crimson-dark)] mb-4">
          Review all sections and items above. When you're satisfied, publish this lesson to make it
          available to students.
        </p>
        <Button
          onClick={() => m.mutate()}
          disabled={m.isPending}
          className="bg-[var(--crimson)] hover:bg-[var(--crimson-dark)]"
        >
          {m.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Publish Lesson
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

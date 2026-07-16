import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { generateLessonsForCourse } from "@/lib/lesson-generation.functions";
import { getCourseMateriaisText } from "@/lib/course-materials.functions";

interface LessonGenerationModalProps {
  courseId: string;
  courseTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LessonGenerationModal({
  courseId,
  courseTitle,
  isOpen,
  onOpenChange,
  onSuccess,
}: LessonGenerationModalProps) {
  const [step, setStep] = useState<"settings" | "generating" | "results">("settings");
  const [settings, setSettings] = useState({
    lessonCount: 5,
    level: "standard",
    durationMin: 35,
    durationMax: 35,
    timelineWeeks: undefined as number | undefined,
    includeGuidedPractice: true,
    includeIndependentPractice: true,
    includeImages: true,
    teachingDepth: "standard",
  });

  const [results, setResults] = useState<{
    createdCount: number;
    createdLessons: Array<{ lessonId: string; title: string; sections: number; items: number }>;
    note: string | null;
    usedAI: boolean;
  } | null>(null);

  const qc = useQueryClient();
  const getTextFn = useServerFn(getCourseMateriaisText);
  const generateFn = useServerFn(generateLessonsForCourse);

  const m = useMutation({
    mutationFn: async () => {
      setStep("generating");

      // Get course materials text
      const textResult = await getTextFn({ data: { course_id: courseId } });

      if (textResult.materialCount === 0) {
        throw new Error("No materials available. Please upload course materials first.");
      }

      // Generate lessons
      const genResult = await generateFn({
        data: {
          course_id: courseId,
          requested_count: settings.lessonCount,
          level: settings.level,
          timeline_weeks: settings.timelineWeeks,
          material_text: textResult.combinedText,
        },
      });

      setResults({
        createdCount: genResult.createdCount,
        createdLessons: genResult.created,
        note: genResult.note,
        usedAI: genResult.usedAI,
      });

      setStep("results");
      return genResult;
    },
    onSuccess: (result) => {
      toast.success(`Generated ${result.createdCount} lessons successfully`);
      qc.invalidateQueries({ queryKey: ["lessons", courseId] });
      onSuccess?.();
    },
    onError: (e: Error) => {
      toast.error(e.message || "Generation failed");
      setStep("settings");
    },
  });

  const handleClose = () => {
    if (step === "generating") return; // Don't close while generating
    onOpenChange(false);
    setStep("settings");
    setResults(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Lessons for {courseTitle}</DialogTitle>
        </DialogHeader>

        {step === "settings" && (
          <div className="space-y-6">
            {/* Number of Lessons */}
            <div>
              <Label>Number of Lessons</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[settings.lessonCount]}
                  onValueChange={(val) => setSettings({ ...settings, lessonCount: val[0] })}
                  min={1}
                  max={20}
                  step={1}
                  className="flex-1"
                />
                <span className="text-lg font-semibold w-12">{settings.lessonCount}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Generate between 1 and 20 lessons
              </p>
            </div>

            {/* Teaching Level */}
            <div>
              <Label htmlFor="level">Teaching Level</Label>
              <Select
                value={settings.level}
                onValueChange={(val) => setSettings({ ...settings, level: val })}
              >
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (simplified explanations)</SelectItem>
                  <SelectItem value="standard">Standard (clear explanations)</SelectItem>
                  <SelectItem value="detailed">Detailed (in-depth coverage)</SelectItem>
                  <SelectItem value="intensive">Intensive (comprehensive depth)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration Per Lesson */}
            <div>
              <Label>Duration Per Lesson</Label>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-muted-foreground">Min:</span>
                <Slider
                  value={[settings.durationMin]}
                  onValueChange={(val) => setSettings({ ...settings, durationMin: val[0] })}
                  min={15}
                  max={60}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm font-semibold w-12">{settings.durationMin} min</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Lessons will target this duration
              </p>
            </div>

            {/* Timeline (Optional) */}
            <div>
              <Label htmlFor="timeline">Programme Timeline (Optional)</Label>
              <Input
                id="timeline"
                type="number"
                min={1}
                max={52}
                placeholder="Number of weeks"
                value={settings.timelineWeeks || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    timelineWeeks: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                For context: how many weeks is the course?
              </p>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="guided"
                  checked={settings.includeGuidedPractice}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, includeGuidedPractice: checked === true })
                  }
                />
                <Label htmlFor="guided" className="font-normal cursor-pointer">
                  Include Guided Practice
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="independent"
                  checked={settings.includeIndependentPractice}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, includeIndependentPractice: checked === true })
                  }
                />
                <Label htmlFor="independent" className="font-normal cursor-pointer">
                  Include Independent Practice
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="images"
                  checked={settings.includeImages}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, includeImages: checked === true })
                  }
                />
                <Label htmlFor="images" className="font-normal cursor-pointer">
                  Include Images from Materials
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => m.mutate()} disabled={m.isPending}>
                Generate {settings.lessonCount} Lessons
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "generating" && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#7D2233]" />
            <h3 className="font-semibold">Generating Lessons...</h3>
            <p className="text-sm text-muted-foreground">
              This may take a minute. We're creating {settings.lessonCount} complete lessons with
              sections, teaching items, and explanations.
            </p>
          </div>
        )}

        {step === "results" && results && (
          <div className="space-y-4">
            {/* Status Message */}
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900">Success!</h4>
                <p className="text-sm text-green-800 mt-1">
                  Generated {results.createdCount} of {settings.lessonCount} requested lessons
                </p>
              </div>
            </div>

            {/* AI Usage Note */}
            {!results.usedAI && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Template Used</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    AI generation was not available. Template lessons were created instead.
                  </p>
                </div>
              </div>
            )}

            {results.note && (
              <div className="p-4 bg-[#F7E7EA] border border-[#F7E7EA] rounded-lg">
                <p className="text-sm text-[#191314]">{results.note}</p>
              </div>
            )}

            {/* Created Lessons List */}
            <div>
              <h4 className="font-semibold mb-3">Created Lessons</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.createdLessons.map((lesson, idx) => (
                  <div key={lesson.lessonId} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">
                          {idx + 1}. {lesson.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {lesson.sections} sections, {lesson.items} teaching items
                        </p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Draft
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-4 bg-[#F7E7EA] border border-[#F7E7EA] rounded-lg">
              <h4 className="font-semibold text-[#191314] mb-2">Next Steps</h4>
              <ol className="text-sm text-[#521326] space-y-1 list-decimal list-inside">
                <li>Review and edit lessons to customize content</li>
                <li>Publish lessons when ready</li>
                <li>Learners can then access lessons in their course</li>
              </ol>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { getKingpinGrade9MathematicsCourses } from "./kingpin-grade9-mathematics-catalog";
import { buildKingpinGrade9MathematicsClassroomContent } from "./kingpin-grade9-mathematics-classroom";

async function assertPlatformAdmin(context: any): Promise<void> {
    if (!context?.userId) throw new Error("Authentication required.");
    if (!isSupabaseConfigured()) throw new Error("Supabase is not configured.");

    const { data, error } = await context.supabase
        .from("profiles")
        .select("role")
        .eq("id", context.userId)
        .maybeSingle();

    if (error) throw new Error(error.message);
    if (data?.role !== "platform_admin") throw new Error("Platform admin access required.");
}

async function getAdminClient() {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return supabaseAdmin;
}

function compactJson(value: unknown) {
    return value && typeof value === "object" ? value : {};
}

function sectionTypeToDbType(sectionKey: string) {
    switch (sectionKey) {
        case "welcome":
            return "welcome";
        case "concept":
            return "concept";
        case "worked_example":
            return "worked_example";
        case "guided_practice":
            return "guided_practice";
        case "independent_practice":
            return "independent_practice";
        case "summary":
            return "summary";
        default:
            return "concept";
    }
}

function itemTypeToDbType(type: string) {
    if (["heading", "bullet", "image", "diagram", "warning"].includes(type)) return "concept";
    return type;
}

function segmentLessonContent(content: ReturnType<typeof buildKingpinGrade9MathematicsClassroomContent>) {
    if (!content) return [] as Array<{ key: string; title: string; estimatedMinutes: number; items: any[] }>;
    const stops = [...content.sectionStops, { key: "complete", startIndex: content.sequence.length }];

    return stops.slice(0, -1).map((stop, index) => {
        const endIndex = stops[index + 1]?.startIndex ?? content.sequence.length;
        const items = content.sequence.slice(stop.startIndex, endIndex);
        return {
            key: stop.key,
            title: content.sectionGoals[stop.key] ?? stop.key,
            estimatedMinutes: Math.max(4, Math.ceil((items.length / Math.max(content.sequence.length, 1)) * 45)),
            items,
        };
    });
}

export const syncKingpinGrade9MathematicsCatalog = createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .validator((data: unknown) => z.object({ publishPublicCourse: z.boolean().default(true) }).parse(data ?? {}))
    .handler(async ({ data, context }: any) => {
        await assertPlatformAdmin(context);
        const admin = await getAdminClient();

        const { data: institution, error: institutionError } = await admin
            .from("institutions")
            .select("id, slug, name")
            .eq("slug", "kingpin-academy")
            .maybeSingle();

        if (institutionError) throw new Error(institutionError.message);
        if (!institution) throw new Error("KingPin Academy institution record was not found.");

        const { data: programmes, error: programmesError } = await admin
            .from("programmes")
            .select("id, title, grade, country, curriculum_family")
            .eq("institution_id", institution.id)
            .eq("grade", 9);

        if (programmesError) throw new Error(programmesError.message);

        const grade9Programme = (programmes ?? []).find(
            (programme: any) =>
                (programme.title ?? "").toLowerCase().includes("kenyan cbc grade 9") ||
                (programme.country === "Kenya" && programme.curriculum_family === "CBC" && programme.grade === 9),
        );

        if (!grade9Programme) throw new Error("Kenyan CBC Grade 9 programme was not found for KingPin Academy.");

        const courses = getKingpinGrade9MathematicsCourses();
        const results: Array<{ courseId: string; title: string; syncedLessons: number; publishedLessons: number }> = [];

        for (const course of courses) {
            const shouldPublishCourse = data.publishPublicCourse && (course.id.includes("full-year") || course.id.includes("term1"));

            const { data: syncedCourse, error: courseError } = await admin
                .from("courses")
                .upsert(
                    {
                        institution_id: institution.id,
                        programme_id: grade9Programme.id,
                        title: course.title,
                        slug: course.slug,
                        description: course.description,
                        subject: "Mathematics",
                        level: "Grade 9",
                        status: shouldPublishCourse ? "published" : "draft",
                        source_type: "kingpin",
                        price_usd: 0,
                        pricing_label: "Free enrollment",
                        currency: "USD",
                        country: "Kenya",
                        curriculum_family: "CBC",
                        grade: 9,
                        curriculum_subject: "Mathematics",
                        curriculum_subject_slug: "mathematics",
                        timeline_weeks: course.modules.length * 12,
                        target_lesson_count: course.modules.reduce((sum, module) => sum + module.lessons.length, 0),
                        curriculum_metadata: compactJson({
                            catalogOrigin: "kingpin_grade9_mathematics_code_catalog",
                            owner: course.owner,
                            audience: course.audience,
                            includedResources: course.includedResources,
                            assessmentModel: course.assessmentModel,
                            moduleIds: course.modules.map((module) => module.id),
                        }) as any,
                    },
                    { onConflict: "institution_id,slug" },
                )
                .select("id")
                .single();

            if (courseError) throw new Error(courseError.message);

            const { data: existingLessons, error: existingLessonsError } = await admin
                .from("lessons")
                .select("id, title")
                .eq("course_id", syncedCourse.id);

            if (existingLessonsError) throw new Error(existingLessonsError.message);

            const byTitle = new Map((existingLessons ?? []).map((lesson: any) => [lesson.title, lesson]));

            let orderIndex = 0;
            let publishedLessons = 0;
            for (const module of course.modules) {
                for (const lesson of module.lessons) {
                    const classroomContent = buildKingpinGrade9MathematicsClassroomContent(lesson.id);
                    const isPublishedLesson = shouldPublishCourse && module.id === "term1" && Boolean(classroomContent);
                    if (isPublishedLesson) publishedLessons += 1;

                    const lessonPayload = {
                        institution_id: institution.id,
                        course_id: syncedCourse.id,
                        programme_id: grade9Programme.id,
                        title: lesson.title,
                        objective: lesson.objective,
                        syllabus_reference: `Kenyan CBC Grade 9 Mathematics · ${module.title}`,
                        order_index: orderIndex++,
                        minimum_duration_minutes: 40,
                        estimated_duration_minutes: lesson.durationMinutes,
                        duration_minutes: lesson.durationMinutes,
                        source_material_ids: [],
                        generation_mode: "manual",
                        status: isPublishedLesson ? "published" : "draft",
                        created_by: context.userId,
                        lesson_data_json: {
                            seedKey: lesson.id,
                            sourceType: "kingpin_catalog",
                            disciplineType: "mathematics",
                            moduleId: module.id,
                            moduleTitle: module.title,
                            objective: lesson.objective,
                            outcomes: lesson.outcomes,
                            classroomReady: Boolean(classroomContent),
                            curriculum: {
                                country: "Kenya",
                                curriculumFamily: "CBC",
                                grade: 9,
                                subject: "Mathematics",
                                subjectSlug: "mathematics",
                                strand: module.title,
                                subStrand: lesson.title,
                            },
                            pacingPlan: classroomContent?.pacingPlan ?? null,
                            visualPlan: classroomContent?.visualPlan ?? [],
                            instructionalSegments: classroomContent?.instructionalSegments ?? [],
                            reteachMoments: classroomContent?.reteachMoments ?? [],
                            guidedQuestions: classroomContent?.guidedQuestions ?? [],
                            practiceCycles: classroomContent?.practiceCycles ?? [],
                        } as any,
                    };

                    const existing = byTitle.get(lesson.title);
                    let lessonId = existing?.id as string | undefined;

                    if (lessonId) {
                        const { error } = await admin.from("lessons").update(lessonPayload).eq("id", lessonId);
                        if (error) throw new Error(error.message);
                    } else {
                        const { data: insertedLesson, error } = await admin
                            .from("lessons")
                            .insert(lessonPayload)
                            .select("id")
                            .single();
                        if (error) throw new Error(error.message);
                        lessonId = insertedLesson.id;
                    }

                    if (classroomContent && lessonId) {
                        await admin.from("teaching_items").delete().eq("lesson_id", lessonId);
                        await admin.from("lesson_sections").delete().eq("lesson_id", lessonId);

                        const segments = segmentLessonContent(classroomContent);
                        let sectionOrder = 0;
                        for (const segment of segments) {
                            const { data: sectionRow, error: sectionError } = await admin
                                .from("lesson_sections")
                                .insert({
                                    institution_id: institution.id,
                                    course_id: syncedCourse.id,
                                    lesson_id: lessonId,
                                    title: segment.title,
                                    type: sectionTypeToDbType(segment.key),
                                    order_index: sectionOrder++,
                                    estimated_minutes: segment.estimatedMinutes,
                                })
                                .select("id")
                                .single();

                            if (sectionError) throw new Error(sectionError.message);

                            const itemRows = segment.items.map((entry: any, index: number) => ({
                                institution_id: institution.id,
                                course_id: syncedCourse.id,
                                lesson_id: lessonId,
                                section_id: sectionRow.id,
                                order_index: index,
                                type: itemTypeToDbType(entry.type),
                                board_text: entry.boardText,
                                exact_spoken_text: entry.exactSpokenText,
                                teacher_explanation: entry.teacherExplanation,
                                learner_notes: entry.whyThisStepMatters,
                                accessible_description: entry.accessibleDescription,
                                why_this_matters: entry.whyThisStepMatters,
                                common_mistake: entry.commonMistake ?? null,
                                image_alt: entry.visualCue?.imageAlt ?? entry.visualCue?.title ?? null,
                                estimated_seconds: 150,
                            }));

                            const { error: itemsError } = await admin.from("teaching_items").insert(itemRows);
                            if (itemsError) throw new Error(itemsError.message);
                        }
                    }
                }
            }

            results.push({
                courseId: syncedCourse.id,
                title: course.title,
                syncedLessons: course.modules.reduce((sum, module) => sum + module.lessons.length, 0),
                publishedLessons,
            });
        }

        return {
            institutionId: institution.id,
            programmeId: grade9Programme.id,
            syncedCourses: results.length,
            results,
        };
    });

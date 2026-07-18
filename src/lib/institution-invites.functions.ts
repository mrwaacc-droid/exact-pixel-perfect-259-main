import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  createAuditLog,
  requireInstitutionAdminAccess,
  requireInstitutionStaffAccess,
} from "@/lib/institution-admin.foundation";
import {
  createInviteToken,
  getAppUrl,
  memberRoleToUserRole,
  normalizeEmail,
  queueEmailJob,
  sha256Hex,
} from "@/lib/onboarding.foundation";

const InviteRoleSchema = z.enum(["admin", "teacher", "student"]);

const CreateInviteSchema = z.object({
  institution_id: z.string().uuid(),
  email: z.string().trim().email().max(255),
  full_name: z.string().trim().max(200).optional(),
  role: InviteRoleSchema,
  message: z.string().trim().max(1000).optional(),
  expires_in_days: z.number().int().min(1).max(90).default(14),
});

const AcceptInviteSchema = z.object({
  token: z.string().min(24).max(512),
});

const AssignTeacherCourseSchema = z.object({
  institution_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  course_id: z.string().uuid(),
  role: z.string().trim().min(1).max(80).default("teacher"),
});

const RemoveTeacherCourseSchema = z.object({
  institution_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  course_id: z.string().uuid(),
});

type TeacherProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  public_id: string | null;
  teacher_number: string | null;
  teacher_type: string | null;
};

async function requireInstitutionAdminMembership(
  supabaseAdmin: any,
  institutionId: string,
  userId: string,
) {
  const { data, error } = await supabaseAdmin
    .from("institution_members")
    .select("id, role, status")
    .eq("institution_id", institutionId)
    .eq("user_id", userId)
    .eq("status", "active")
    .in("role", ["owner", "admin"])
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("You do not have permission to manage invites for this institution.");
  return data;
}

export const listInstitutionInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { institution_id: string }) => data)
  .handler(async ({ data, context }: any) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await requireInstitutionAdminMembership(supabaseAdmin, data.institution_id, context.userId);

    const { data: invites, error } = await supabaseAdmin
      .from("institution_invites")
      .select(
        "id, email, full_name, role, status, expires_at, accepted_at, accepted_user_id, message, created_at, updated_at",
      )
      .eq("institution_id", data.institution_id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { invites: invites ?? [] };
  });

export const listInstitutionTeachers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { institution_id: string }) =>
    z.object({ institution_id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await requireInstitutionStaffAccess(supabaseAdmin, data.institution_id, context.userId);

    const [membersResult, invitesResult, coursesResult] = await Promise.all([
      supabaseAdmin
        .from("institution_members")
        .select("id, user_id, role, status, created_at, updated_at")
        .eq("institution_id", data.institution_id)
        .eq("role", "teacher")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("institution_invites")
        .select("id, email, full_name, role, status, expires_at, created_at, accepted_at")
        .eq("institution_id", data.institution_id)
        .eq("role", "teacher")
        .in("status", ["pending", "sent"])
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("courses")
        .select("id, title, subject, status")
        .eq("institution_id", data.institution_id)
        .order("title", { ascending: true }),
    ]);

    if (membersResult.error) throw new Error(membersResult.error.message);
    if (invitesResult.error) throw new Error(invitesResult.error.message);
    if (coursesResult.error) throw new Error(coursesResult.error.message);

    const members = membersResult.data ?? [];
    const teacherIds = members.map((member: any) => member.user_id).filter(Boolean);

    const [profilesResult, assignmentsResult] = await Promise.all([
      teacherIds.length
        ? supabaseAdmin
            .from("profiles")
            .select("id, full_name, email, avatar_url, public_id, teacher_number, teacher_type")
            .in("id", teacherIds)
        : Promise.resolve({ data: [], error: null }),
      teacherIds.length
        ? supabaseAdmin
            .from("course_teachers")
            .select("id, teacher_id, course_id, role, created_at")
            .in("teacher_id", teacherIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (profilesResult.error) throw new Error(profilesResult.error.message);
    if (assignmentsResult.error) throw new Error(assignmentsResult.error.message);

    const profilesById = new Map(
      ((profilesResult.data ?? []) as TeacherProfile[]).map((profile) => [profile.id, profile]),
    );
    const coursesById = new Map((coursesResult.data ?? []).map((course: any) => [course.id, course]));
    const assignmentsByTeacher = new Map<string, any[]>();
    for (const assignment of assignmentsResult.data ?? []) {
      const teacherAssignments = assignmentsByTeacher.get(assignment.teacher_id) ?? [];
      teacherAssignments.push({
        id: assignment.id,
        courseId: assignment.course_id,
        courseTitle: coursesById.get(assignment.course_id)?.title ?? "Course",
        subject: coursesById.get(assignment.course_id)?.subject ?? null,
        role: assignment.role,
        assignedAt: assignment.created_at,
      });
      assignmentsByTeacher.set(assignment.teacher_id, teacherAssignments);
    }

    const teachers = members.map((member: any) => {
      const profile = profilesById.get(member.user_id) ?? null;
      return {
        membershipId: member.id,
        userId: member.user_id,
        status: member.status,
        memberRole: member.role,
        joinedAt: member.created_at,
        updatedAt: member.updated_at,
        fullName: profile?.full_name ?? null,
        email: profile?.email ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        publicId: profile?.public_id ?? null,
        teacherNumber: profile?.teacher_number ?? null,
        teacherType: profile?.teacher_type ?? null,
        assignments: assignmentsByTeacher.get(member.user_id) ?? [],
      };
    });

    return {
      teachers,
      pendingInvites: invitesResult.data ?? [],
      courses: coursesResult.data ?? [],
      stats: {
        activeTeachers: teachers.filter((teacher: any) => teacher.status === "active").length,
        pendingInvites: (invitesResult.data ?? []).length,
        assignedTeachers: teachers.filter((teacher: any) => teacher.assignments.length > 0).length,
        courses: (coursesResult.data ?? []).length,
      },
    };
  });

export const listInstitutionStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { institution_id: string }) =>
    z.object({ institution_id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }: any) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await requireInstitutionStaffAccess(supabaseAdmin, data.institution_id, context.userId);

    const [membersResult, invitesResult] = await Promise.all([
      supabaseAdmin
        .from("institution_members")
        .select("id, user_id, role, status, created_at, updated_at")
        .eq("institution_id", data.institution_id)
        .eq("role", "student")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("institution_invites")
        .select("id, email, full_name, role, status, expires_at, created_at, accepted_at")
        .eq("institution_id", data.institution_id)
        .eq("role", "student")
        .in("status", ["pending", "sent"])
        .order("created_at", { ascending: false }),
    ]);

    if (membersResult.error) throw new Error(membersResult.error.message);
    if (invitesResult.error) throw new Error(invitesResult.error.message);

    const members = membersResult.data ?? [];
    const studentIds = members.map((member: any) => member.user_id).filter(Boolean);

    const [profilesResult, enrollmentsResult] = await Promise.all([
      studentIds.length
        ? supabaseAdmin
            .from("profiles")
            .select("id, full_name, email, avatar_url, public_id")
            .in("id", studentIds)
        : Promise.resolve({ data: [], error: null }),
      studentIds.length
        ? supabaseAdmin
            .from("course_enrollments")
            .select("student_id, course_id, status")
            .in("student_id", studentIds)
            .eq("institution_id", data.institution_id)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (profilesResult.error) throw new Error(profilesResult.error.message);
    if (enrollmentsResult.error) throw new Error(enrollmentsResult.error.message);

    const profilesById = new Map(
      ((profilesResult.data ?? []) as any[]).map((profile) => [profile.id, profile]),
    );
    const enrollmentCountByStudent = new Map<string, number>();
    for (const enrollment of enrollmentsResult.data ?? []) {
      if (enrollment.status !== "active" && enrollment.status !== "completed") continue;
      enrollmentCountByStudent.set(
        enrollment.student_id,
        (enrollmentCountByStudent.get(enrollment.student_id) ?? 0) + 1,
      );
    }

    const students = members.map((member: any) => {
      const profile = profilesById.get(member.user_id) ?? null;
      return {
        membershipId: member.id,
        userId: member.user_id,
        status: member.status,
        joinedAt: member.created_at,
        fullName: profile?.full_name ?? null,
        email: profile?.email ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        publicId: profile?.public_id ?? null,
        enrolledCourses: enrollmentCountByStudent.get(member.user_id) ?? 0,
      };
    });

    return {
      students,
      pendingInvites: invitesResult.data ?? [],
      stats: {
        activeStudents: students.filter((s: any) => s.status === "active").length,
        pendingInvites: (invitesResult.data ?? []).length,
        enrolled: students.filter((s: any) => s.enrolledCourses > 0).length,
      },
    };
  });

export const assignTeacherToCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => AssignTeacherCourseSchema.parse(data))
  .handler(async ({ data, context }: any) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const membership = await requireInstitutionAdminAccess(
      supabaseAdmin,
      data.institution_id,
      context.userId,
    );

    const [{ data: teacherMember, error: teacherError }, { data: course, error: courseError }] =
      await Promise.all([
        supabaseAdmin
          .from("institution_members")
          .select("id, role, status")
          .eq("institution_id", data.institution_id)
          .eq("user_id", data.teacher_id)
          .eq("role", "teacher")
          .eq("status", "active")
          .maybeSingle(),
        supabaseAdmin
          .from("courses")
          .select("id, title, institution_id")
          .eq("id", data.course_id)
          .eq("institution_id", data.institution_id)
          .maybeSingle(),
      ]);

    if (teacherError) throw new Error(teacherError.message);
    if (courseError) throw new Error(courseError.message);
    if (!teacherMember) throw new Error("Teacher is not an active member of this institution.");
    if (!course) throw new Error("Course not found in this institution.");

    const { data: assignment, error } = await supabaseAdmin
      .from("course_teachers")
      .upsert(
        {
          course_id: data.course_id,
          teacher_id: data.teacher_id,
          role: data.role,
        },
        { onConflict: "course_id,teacher_id" },
      )
      .select("id, course_id, teacher_id, role, created_at")
      .single();

    if (error) throw new Error(error.message);

    await createAuditLog(supabaseAdmin, {
      institutionId: data.institution_id,
      actorUserId: context.userId,
      actorRole: membership.role,
      action: "teacher.course_assigned",
      entityType: "course_teacher",
      entityId: assignment.id,
      summary: `Assigned teacher to ${course.title}`,
      details: { teacher_id: data.teacher_id, course_id: data.course_id, role: data.role },
    });

    return { ok: true, assignment };
  });

export const removeTeacherFromCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => RemoveTeacherCourseSchema.parse(data))
  .handler(async ({ data, context }: any) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const membership = await requireInstitutionAdminAccess(
      supabaseAdmin,
      data.institution_id,
      context.userId,
    );

    const { error } = await supabaseAdmin
      .from("course_teachers")
      .delete()
      .eq("course_id", data.course_id)
      .eq("teacher_id", data.teacher_id);

    if (error) throw new Error(error.message);

    await createAuditLog(supabaseAdmin, {
      institutionId: data.institution_id,
      actorUserId: context.userId,
      actorRole: membership.role,
      action: "teacher.course_unassigned",
      entityType: "course_teacher",
      summary: "Removed teacher from course",
      details: { teacher_id: data.teacher_id, course_id: data.course_id },
    });

    return { ok: true };
  });

export const createInstitutionInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => CreateInviteSchema.parse(data))
  .handler(async ({ data, context }: any) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await requireInstitutionAdminMembership(supabaseAdmin, data.institution_id, context.userId);

    const normalizedEmail = normalizeEmail(data.email);
    const { data: institution, error: instError } = await supabaseAdmin
      .from("institutions")
      .select("id, name, slug, onboarding_status")
      .eq("id", data.institution_id)
      .single();
    if (instError || !institution) throw new Error(instError?.message || "Institution not found.");

    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);

    if (existingProfile?.id) {
      const { data: existingMembership, error: memberError } = await supabaseAdmin
        .from("institution_members")
        .select("id, status, role")
        .eq("institution_id", institution.id)
        .eq("user_id", existingProfile.id)
        .maybeSingle();
      if (memberError) throw new Error(memberError.message);
      if (existingMembership?.status === "active") {
        throw new Error("That user is already an active member of this institution.");
      }
    }

    await supabaseAdmin
      .from("institution_invites")
      .update({ status: "revoked" })
      .eq("institution_id", institution.id)
      .eq("email", normalizedEmail)
      .in("status", ["pending", "sent"]);

    const token = createInviteToken();
    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(
      Date.now() + data.expires_in_days * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("institution_invites")
      .insert({
        institution_id: institution.id,
        email: normalizedEmail,
        full_name: data.full_name ?? null,
        role: data.role,
        invited_by: context.userId,
        status: "sent",
        token_hash: tokenHash,
        expires_at: expiresAt,
        message: data.message ?? null,
        metadata_json: {
          institution_slug: institution.slug,
          invited_existing_user: Boolean(existingProfile?.id),
        },
      })
      .select("id, email, role, status, expires_at")
      .single();
    if (inviteError || !invite) throw new Error(inviteError?.message || "Could not create invite.");

    const inviteUrl = `${getAppUrl()}/auth?invite=${encodeURIComponent(token)}`;

    await queueEmailJob(supabaseAdmin, {
      institutionId: institution.id,
      relatedInviteId: invite.id,
      relatedUserId: existingProfile?.id ?? null,
      kind: "institution_invite",
      templateKey: "institution_member_invite",
      toEmail: normalizedEmail,
      toName: data.full_name ?? null,
      subject: `You have been invited to join ${institution.name} on Klassruum`,
      idempotencyKey: `invite:${invite.id}:institution_member_invite`,
      payload: {
        institution_name: institution.name,
        institution_slug: institution.slug,
        invite_url: inviteUrl,
        role: data.role,
        expires_at: expiresAt,
        message: data.message ?? null,
      },
    });

    await supabaseAdmin
      .from("institutions")
      .update({
        onboarding_status:
          institution.onboarding_status === "owner_created"
            ? "invites_sent"
            : institution.onboarding_status,
      })
      .eq("id", institution.id);

    await createAuditLog(supabaseAdmin, {
      institutionId: institution.id,
      actorUserId: context.userId,
      actorRole: "admin",
      action: "institution_invite.created",
      entityType: "institution_invite",
      entityId: invite.id,
      summary: `Created ${data.role} invite for ${normalizedEmail}`,
      details: { expires_at: expiresAt },
    });

    return { ok: true, invite, invite_url: inviteUrl };
  });

export const acceptInstitutionInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => AcceptInviteSchema.parse(data))
  .handler(async ({ data, context }: any) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const emailFromClaims = normalizeEmail(context.claims?.email ?? "");
    if (!emailFromClaims) throw new Error("Your account email could not be verified.");

    const tokenHash = await sha256Hex(data.token);
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("institution_invites")
      .select("id, institution_id, email, full_name, role, status, expires_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (inviteError) throw new Error(inviteError.message);
    if (!invite) throw new Error("Invite not found or already used.");

    if (!["pending", "sent"].includes(invite.status)) {
      throw new Error("This invite is no longer active.");
    }
    if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
      await supabaseAdmin
        .from("institution_invites")
        .update({ status: "expired" })
        .eq("id", invite.id);
      throw new Error("This invite has expired.");
    }
    if (normalizeEmail(invite.email) !== emailFromClaims) {
      throw new Error("This invite belongs to a different email address.");
    }

    const membershipRole = invite.role as "owner" | "admin" | "teacher" | "student";
    const profileRole = memberRoleToUserRole(membershipRole);

    const { error: profileUpdateError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: context.userId,
        email: emailFromClaims,
        full_name: invite.full_name ?? null,
        role: profileRole,
      },
      { onConflict: "id" },
    );
    if (profileUpdateError) throw new Error(profileUpdateError.message);

    const { error: membershipError } = await supabaseAdmin.from("institution_members").upsert(
      {
        institution_id: invite.institution_id,
        user_id: context.userId,
        role: membershipRole,
        status: "active",
      },
      { onConflict: "institution_id,user_id" },
    );
    if (membershipError) throw new Error(membershipError.message);

    const acceptedAt = new Date().toISOString();
    const { error: acceptError } = await supabaseAdmin
      .from("institution_invites")
      .update({
        status: "accepted",
        accepted_at: acceptedAt,
        accepted_user_id: context.userId,
      })
      .eq("id", invite.id);
    if (acceptError) throw new Error(acceptError.message);

    await queueEmailJob(supabaseAdmin, {
      institutionId: invite.institution_id,
      relatedInviteId: invite.id,
      relatedUserId: context.userId,
      kind: "institution_invite_accepted",
      templateKey: "institution_invite_accepted",
      toEmail: emailFromClaims,
      toName: invite.full_name ?? null,
      subject: "Your Klassruum institution invite has been accepted",
      idempotencyKey: `invite:${invite.id}:accepted:${context.userId}`,
      payload: {
        accepted_at: acceptedAt,
        institution_id: invite.institution_id,
        role: membershipRole,
      },
    });

    await createAuditLog(supabaseAdmin, {
      institutionId: invite.institution_id,
      actorUserId: context.userId,
      actorRole: profileRole,
      action: "institution_invite.accepted",
      entityType: "institution_invite",
      entityId: invite.id,
      summary: `Accepted institution invite for ${emailFromClaims}`,
      details: { membership_role: membershipRole },
    });

    return {
      ok: true,
      institution_id: invite.institution_id,
      membership_role: membershipRole,
      profile_role: profileRole,
    };
  });

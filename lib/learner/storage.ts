import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/database";
import { hashPassword } from "@/lib/learner/auth";

function database() {
  if (!sql) throw new Error("DATABASE_URL is required for the learner portal.");
  return sql;
}
export type SubmissionFile = {
  key: string;
  name: string;
  contentType: string;
  size: number;
};

export async function listLearners() {
  const db = database();
  const rows =
    await db`SELECT a.id, a.name, a.email, a.active, a.must_change_password, a.created_at, COALESCE(array_agg(e.course_id) FILTER (WHERE e.course_id IS NOT NULL), '{}') courses FROM learner_accounts a LEFT JOIN learner_enrolments e ON e.learner_id=a.id GROUP BY a.id ORDER BY a.name`;
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    email: String(r.email),
    active: Boolean(r.active),
    mustChangePassword: Boolean(r.must_change_password),
    createdAt: new Date(r.created_at).toISOString(),
    courseIds: r.courses as string[],
  }));
}

export async function createLearner(input: {
  name: string;
  email: string;
  password: string;
  courseIds: string[];
}) {
  const db = database();
  const id = randomUUID();
  const passwordHash = await hashPassword(input.password);
  await db.begin(async (tx) => {
    await tx`INSERT INTO learner_accounts (id,name,email,password_hash) VALUES (${id},${input.name.trim()},${input.email.trim().toLowerCase()},${passwordHash})`;
    for (const courseId of input.courseIds)
      await tx`INSERT INTO learner_enrolments (id,learner_id,course_id) VALUES (${randomUUID()},${id},${courseId})`;
  });
  return id;
}

export async function setLearnerCourses(
  learnerId: string,
  courseIds: string[],
) {
  const db = database();
  await db.begin(async (tx) => {
    await tx`DELETE FROM learner_enrolments WHERE learner_id=${learnerId}`;
    for (const courseId of courseIds)
      await tx`INSERT INTO learner_enrolments (id,learner_id,course_id) VALUES (${randomUUID()},${learnerId},${courseId})`;
  });
}
export async function resetLearnerPassword(id: string, password: string) {
  const db = database();
  await db`UPDATE learner_accounts SET password_hash=${await hashPassword(password)},must_change_password=true,updated_at=now() WHERE id=${id}`;
  await db`DELETE FROM learner_sessions WHERE learner_id=${id}`;
}
export async function changeLearnerPassword(id: string, password: string) {
  const db = database();
  await db`UPDATE learner_accounts SET password_hash=${await hashPassword(password)},must_change_password=false,updated_at=now() WHERE id=${id}`;
  await db`DELETE FROM learner_sessions WHERE learner_id=${id}`;
}
export async function findLearnerForLogin(email: string) {
  const db = database();
  const r = (
    await db`SELECT id,email,password_hash,active FROM learner_accounts WHERE email=${email.trim().toLowerCase()} LIMIT 1`
  )[0];
  return (
    r && {
      id: String(r.id),
      email: String(r.email),
      passwordHash: String(r.password_hash),
      active: Boolean(r.active),
    }
  );
}
export async function getLearnerCourseIds(id: string) {
  const db = database();
  return (
    await db`SELECT course_id FROM learner_enrolments WHERE learner_id=${id} ORDER BY enrolled_at`
  ).map((r) => String(r.course_id));
}
export async function getLearnerSubmissions(id: string) {
  const db = database();
  const rows =
    await db`SELECT * FROM learner_submissions WHERE learner_id=${id} ORDER BY submitted_at DESC`;
  return rows.map((r) => ({
    id: String(r.id),
    courseId: String(r.course_id),
    assignmentId: String(r.assignment_id),
    attempt: Number(r.attempt),
    writtenAnswer: String(r.written_answer),
    files: r.files as SubmissionFile[],
    status: String(r.status),
    feedback: String(r.feedback),
    submittedAt: new Date(r.submitted_at).toISOString(),
    reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).toISOString() : null,
  }));
}
export async function listSubmissions() {
  const db = database();
  const rows =
    await db`SELECT s.*,a.name learner_name,a.email learner_email FROM learner_submissions s JOIN learner_accounts a ON a.id=s.learner_id ORDER BY s.submitted_at DESC`;
  return rows.map((r) => ({
    id: String(r.id),
    learnerId: String(r.learner_id),
    learnerName: String(r.learner_name),
    learnerEmail: String(r.learner_email),
    courseId: String(r.course_id),
    assignmentId: String(r.assignment_id),
    attempt: Number(r.attempt),
    writtenAnswer: String(r.written_answer),
    files: r.files as SubmissionFile[],
    status: String(r.status),
    feedback: String(r.feedback),
    submittedAt: new Date(r.submitted_at).toISOString(),
  }));
}
export async function createSubmission(input: {
  learnerId: string;
  courseId: string;
  assignmentId: string;
  writtenAnswer: string;
  files: SubmissionFile[];
}) {
  const db = database();
  const previous =
    await db`SELECT COALESCE(MAX(attempt),0) attempt FROM learner_submissions WHERE learner_id=${input.learnerId} AND assignment_id=${input.assignmentId}`;
  await db`INSERT INTO learner_submissions (id,learner_id,course_id,assignment_id,attempt,written_answer,files,status) VALUES (${randomUUID()},${input.learnerId},${input.courseId},${input.assignmentId},${Number(previous[0].attempt) + 1},${input.writtenAnswer},${db.json(input.files)},'submitted')`;
}
export async function reviewSubmission(
  id: string,
  status: string,
  feedback: string,
) {
  const db = database();
  await db`UPDATE learner_submissions SET status=${status},feedback=${feedback},reviewed_at=now() WHERE id=${id}`;
}

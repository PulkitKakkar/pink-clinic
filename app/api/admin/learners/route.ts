import { NextResponse } from "next/server";
import { validatePassword } from "@/lib/learner/auth";
import { learnerCourses } from "@/lib/learner/courses";
import {
  createLearner,
  resetLearnerPassword,
  reviewSubmission,
  setLearnerCourses,
} from "@/lib/learner/storage";
import { getPublicOrigin } from "@/lib/public-origin";
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const action = String(form.get("action") || "create");
    const origin = getPublicOrigin(request);
    if (action === "review") {
      const status = String(form.get("status") || "");
      if (!["under-review", "changes-requested", "passed"].includes(status))
        throw new Error("Invalid review status.");
      await reviewSubmission(
        String(form.get("submissionId")),
        status,
        String(form.get("feedback") || ""),
      );
      return NextResponse.redirect(
        new URL("/admin/learners?updated=review", origin),
        303,
      );
    }
    const learnerId = String(form.get("learnerId") || "");
    if (action === "courses") {
      const valid = new Set(learnerCourses.map((c) => c.id));
      await setLearnerCourses(
        learnerId,
        form
          .getAll("courseId")
          .map(String)
          .filter((id) => valid.has(id)),
      );
      return NextResponse.redirect(
        new URL("/admin/learners?updated=courses", origin),
        303,
      );
    }
    const password = String(form.get("password") || "");
    if (!validatePassword(password))
      throw new Error(
        "Password must be at least 12 characters and include upper/lowercase, a number and a symbol.",
      );
    if (action === "reset") await resetLearnerPassword(learnerId, password);
    else {
      const name = String(form.get("name") || "").trim();
      const email = String(form.get("email") || "").trim().toLowerCase();
      const validCourseIds = new Set(learnerCourses.map((course) => course.id));
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new Error("A learner name and valid email are required.");
      await createLearner({
        name,
        email,
        password,
        courseIds: form
          .getAll("courseId")
          .map(String)
          .filter((id) => validCourseIds.has(id)),
      });
    }
    return NextResponse.redirect(
      new URL("/admin/learners?updated=credentials", origin),
      303,
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update learner.",
      },
      { status: 400 },
    );
  }
}

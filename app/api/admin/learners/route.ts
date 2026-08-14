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
  const requestedWithJavaScript =
    request.headers.get("x-requested-with") === "learner-credential-form";
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
        new URL("/academy-admin?updated=review", origin),
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
        new URL("/academy-admin?updated=courses", origin),
        303,
      );
    }
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmation") || "");
    if (password !== confirmation)
      throw new Error("The passwords do not match.");
    if (!validatePassword(password))
      throw new Error(
        "Password must be at least 12 characters and include upper/lowercase, a number and a symbol.",
      );
    if (action === "reset") await resetLearnerPassword(learnerId, password);
    else {
      const name = String(form.get("name") || "").trim();
      const email = String(form.get("email") || "").trim().toLowerCase();
      const validCourseIds = new Set(learnerCourses.map((course) => course.id));
      if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
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
    const redirectTo = "/academy-admin?updated=credentials";
    return requestedWithJavaScript
      ? NextResponse.json({ redirectTo })
      : NextResponse.redirect(new URL(redirectTo, origin), 303);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update learner.";
    if (requestedWithJavaScript)
      return NextResponse.json({ error: message }, { status: 400 });
    return NextResponse.redirect(
      new URL(`/academy-admin?error=${encodeURIComponent(message)}`, getPublicOrigin(request)),
      303,
    );
  }
}

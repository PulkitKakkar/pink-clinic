export function consultationClientName(
  answers: Record<string, string | boolean | string[]>,
) {
  const fullName = String(answers.fullName || "").trim();
  const splitName = [answers.firstName, answers.lastName]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ");
  return fullName || splitName || "Unnamed client";
}

export function consultationStatus(
  answers: Record<string, string | boolean | string[]>,
) {
  return String(answers.recordStatus || "draft");
}

export const submissionStatus = {
  submitted: {
    label: "Submitted",
    guidance: "Your work has been received and is waiting for assessor review.",
    className: "bg-blue-50 text-blue-700",
  },
  "under-review": {
    label: "Under review",
    guidance: "Your assessor is reviewing this attempt. No action is needed yet.",
    className: "bg-amber-50 text-amber-800",
  },
  "changes-requested": {
    label: "Changes requested",
    guidance: "Read the feedback below, update your work and submit a new attempt.",
    className: "bg-red-50 text-red-700",
  },
  passed: {
    label: "Passed",
    guidance: "This assignment has been completed successfully.",
    className: "bg-green-50 text-green-700",
  },
} as const;

export function getSubmissionStatus(status: string | undefined) {
  if (!status) return { label: "Not started", guidance: "Open the assignment when you are ready to begin.", className: "bg-black/5 text-black/55" };
  return submissionStatus[status as keyof typeof submissionStatus] || { label: status.replaceAll("-", " "), guidance: "Check this assignment for the latest details.", className: "bg-black/5 text-black/55" };
}

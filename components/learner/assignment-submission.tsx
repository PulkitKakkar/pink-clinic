"use client";
import { useRef, useState } from "react";
export function AssignmentSubmission({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const input = event.currentTarget.elements.namedItem(
        "documents",
      ) as HTMLInputElement;
      const uploaded = [];
      for (const file of Array.from(input.files || [])) {
        const prepared = await fetch("/api/learner/files", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            assignmentId,
            name: file.name,
            contentType: file.type,
            size: file.size,
          }),
        });
        const data = await prepared.json();
        if (!prepared.ok)
          throw new Error(data.error || "Could not prepare upload.");
        const sent = await fetch(data.uploadUrl, {
          method: "PUT",
          headers: { "content-type": file.type },
          body: file,
        });
        if (!sent.ok) throw new Error(`Could not upload ${file.name}.`);
        uploaded.push({
          key: data.key,
          name: file.name,
          contentType: file.type,
          size: file.size,
        });
      }
      (
        event.currentTarget.elements.namedItem("files") as HTMLInputElement
      ).value = JSON.stringify(uploaded);
      form.current?.submit();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not submit assignment.",
      );
      setBusy(false);
    }
  }
  return (
    <form
      ref={form}
      action="/api/learner/submissions"
      method="post"
      onSubmit={submit}
      className="mt-8 grid gap-4 rounded-2xl bg-white p-6"
    >
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <label className="grid gap-2 text-sm font-bold">
        Written answer
        <textarea
          name="writtenAnswer"
          rows={12}
          className="rounded-xl border border-black/10 p-4 font-normal"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        PDF or Word documents
        <input
          name="documents"
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          className="rounded-xl border border-black/10 p-3 text-xs"
        />
        <span className="font-normal text-black/45">
          Up to five files, 10 MB each.
        </span>
      </label>
      <input type="hidden" name="files" value="[]" />
      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
          {error}
        </p>
      )}
      <button disabled={busy} className="button-primary disabled:opacity-50">
        {busy ? "Uploading…" : "Submit assignment"}
      </button>
    </form>
  );
}

"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { FileText, Save, Trash2, UploadCloud } from "lucide-react";

const maxFiles = 5;
const maxBytes = 10 * 1024 * 1024;
const acceptedTypes = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);

export function AssignmentSubmission({ assignmentId }: { assignmentId: string }) {
  const storageKey = `pink-academy-draft:${assignmentId}`;
  const fileInput = useRef<HTMLInputElement>(null);
  const [answer, setAnswer] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const draft = window.localStorage.getItem(storageKey);
      if (draft) setAnswer(draft);
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => {
      if (answer.trim()) window.localStorage.setItem(storageKey, answer);
      else window.localStorage.removeItem(storageKey);
      setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [answer, loaded, storageKey]);

  function chooseFiles(selected: FileList | null) {
    setError("");
    const incoming = Array.from(selected || []);
    const invalid = incoming.find((file) => !acceptedTypes.has(file.type) || file.size > maxBytes);
    if (invalid) {
      setError(`${invalid.name} is not an accepted PDF or Word file under 10 MB.`);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    const combined = [...files, ...incoming].filter((file, index, all) => all.findIndex((candidate) => candidate.name === file.name && candidate.size === file.size) === index);
    if (combined.length > maxFiles) setError(`You can attach up to ${maxFiles} files.`);
    else setFiles(combined);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!answer.trim() && !files.length) return setError("Add a written answer or at least one file before submitting.");
    if (!ready) return setError("Please confirm that your work is ready for assessor review.");
    setBusy(true);
    try {
      const uploaded = [];
      for (const [index, file] of files.entries()) {
        setProgress(`Uploading file ${index + 1} of ${files.length}: ${file.name}`);
        const prepared = await fetch("/api/learner/files", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ assignmentId, name: file.name, contentType: file.type, size: file.size }),
        });
        const data = (await prepared.json()) as { error?: string; key?: string; uploadUrl?: string };
        if (!prepared.ok || !data.key || !data.uploadUrl) throw new Error(data.error || `Could not prepare ${file.name}.`);
        const sent = await fetch(data.uploadUrl, { method: "PUT", headers: { "content-type": file.type }, body: file });
        if (!sent.ok) throw new Error(`Could not upload ${file.name}. Please try again.`);
        uploaded.push({ key: data.key, name: file.name, contentType: file.type, size: file.size });
      }
      setProgress("Submitting your work…");
      const payload = new FormData();
      payload.set("assignmentId", assignmentId);
      payload.set("writtenAnswer", answer);
      payload.set("files", JSON.stringify(uploaded));
      const response = await fetch("/api/learner/submissions", { method: "POST", body: payload, headers: { "X-Requested-With": "learner-submission-form" } });
      const result = (await response.json()) as { error?: string; redirectTo?: string };
      if (!response.ok) throw new Error(result.error || "Could not submit your assignment.");
      window.localStorage.removeItem(storageKey);
      window.location.assign(result.redirectTo || `/learners/assignments/${assignmentId}?submitted=1`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit your assignment.");
      setProgress("");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-5 rounded-2xl bg-white p-6 shadow-soft" noValidate>
      <div><h2 className="font-display text-3xl">Your submission</h2><p className="mt-1 text-xs text-black/45">Your written answer is saved automatically on this device until you submit it.</p></div>
      <label className="grid gap-2 text-sm font-bold">Written answer
        <textarea name="writtenAnswer" rows={12} value={answer} onChange={(event) => setAnswer(event.target.value)} className="rounded-xl border border-black/10 p-4 font-normal outline-none focus:border-pink" placeholder="Write or paste your answer here…" />
        {loaded && <span className="flex items-center gap-1.5 text-[11px] font-normal text-green-700"><Save size={13} /> {savedAt ? `Draft saved at ${savedAt}` : "Draft recovery is on"}</span>}
      </label>
      <div className="grid gap-3">
        <label className="grid cursor-pointer place-items-center gap-2 rounded-2xl border border-dashed border-pink/30 bg-pink-light/40 p-6 text-center text-sm font-bold text-pink hover:border-pink"><UploadCloud size={24} /> Add PDF or Word documents<span className="font-normal text-black/45">Up to five files, 10 MB each</span><input ref={fileInput} type="file" multiple accept=".pdf,.doc,.docx" onChange={(event) => chooseFiles(event.target.files)} className="sr-only" /></label>
        {files.length > 0 && <ul className="grid gap-2" aria-label="Selected files">{files.map((file, index) => <li key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded-xl border border-black/5 p-3 text-xs"><span className="flex min-w-0 items-center gap-2"><FileText size={15} className="shrink-0 text-pink" /><span className="truncate"><b>{file.name}</b><span className="ml-2 text-black/40">{(file.size / 1024 / 1024).toFixed(1)} MB</span></span></span><button type="button" onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${file.name}`} className="rounded-full p-2 text-red-700 hover:bg-red-50"><Trash2 size={15} /></button></li>)}</ul>}
      </div>
      <label className="flex items-start gap-3 rounded-xl bg-cream p-4 text-xs font-bold"><input type="checkbox" checked={ready} onChange={(event) => setReady(event.target.checked)} className="mt-0.5" />I have checked my work and it is ready for assessor review.</label>
      {progress && <p role="status" className="rounded-xl bg-blue-50 p-3 text-xs font-bold text-blue-700">{progress}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
      <button disabled={busy} className="button-primary disabled:cursor-wait disabled:opacity-60">{busy ? "Submitting…" : "Submit assignment"}</button>
    </form>
  );
}

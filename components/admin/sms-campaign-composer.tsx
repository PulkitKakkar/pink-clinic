"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageSquareText, Send, X } from "lucide-react";
import {
  MARKETING_SMS_FOOTER,
  MARKETING_SMS_MAX_LENGTH,
  prepareMarketingSms,
} from "@/lib/notifications/marketing-sms-utils";

type Recipient = { id: string; name: string; phone: string };

export function SmsCampaignComposer({ recipients }: { recipients: Recipient[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState(() => recipients.map((item) => item.id));
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const prepared = useMemo(() => prepareMarketingSms(message), [message]);
  const tooLong = prepared.length > MARKETING_SMS_MAX_LENGTH;
  const selectedRecipients = useMemo(
    () => recipients.filter((recipient) => selected.includes(recipient.id)),
    [recipients, selected],
  );

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function sendCampaign() {
    if (!selected.length || !message.trim() || tooLong) return;
    if (!window.confirm(`Final confirmation: send this promotional SMS now to ${selected.length} selected customer${selected.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    setSending(true);
    setResult(null);
    try {
      const response = await fetch("/api/admin/sms-campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recipientIds: selected, message }),
      });
      const payload = (await response.json()) as {
        error?: string;
        sent?: number;
        skipped?: number;
        failed?: number;
      };
      if (!response.ok) throw new Error(payload.error || "Could not send the campaign.");
      setResult(
        `${payload.sent || 0} sent · ${payload.skipped || 0} skipped after consent checks · ${payload.failed || 0} failed`,
      );
      setReviewing(false);
      router.refresh();
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Could not send the campaign.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.7fr)]">
      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-pink">Recipients</p>
            <h2 className="mt-2 font-display text-3xl">{selected.length} selected</h2>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelected(recipients.map((item) => item.id))} className="rounded-full border border-black/10 px-3 py-2 text-xs font-bold">Select all</button>
            <button type="button" onClick={() => setSelected([])} className="rounded-full border border-black/10 px-3 py-2 text-xs font-bold">Clear all</button>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-black/45">Only customers with recorded promotional consent and no SMS opt-out are shown. Uncheck anyone you do not want included in this campaign.</p>
        <div className="mt-5 max-h-[520px] overflow-y-auto rounded-xl border border-black/5">
          {recipients.length ? recipients.map((recipient) => (
            <label key={recipient.id} className="flex cursor-pointer items-center gap-3 border-b border-black/5 p-4 last:border-0 hover:bg-pink-light/20">
              <input type="checkbox" checked={selected.includes(recipient.id)} onChange={() => toggle(recipient.id)} className="h-5 w-5 accent-pink" />
              <span className="min-w-0 flex-1"><strong className="block text-sm">{recipient.name}</strong><small className="text-black/45">{recipient.phone}</small></span>
              <CheckCircle2 size={16} className="text-green-600" aria-label="Promotional SMS allowed" />
            </label>
          )) : <p className="p-5 text-sm text-black/45">There are no eligible promotional SMS recipients.</p>}
        </div>
      </section>

      <section className="h-fit rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7">
        <MessageSquareText className="text-pink" size={22} />
        <h2 className="mt-3 font-display text-3xl">Write campaign</h2>
        <label className="mt-5 block text-xs font-bold" htmlFor="campaign-message">Promotional message</label>
        <textarea id="campaign-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={8} placeholder="Tell customers about your offer..." className="mt-2 w-full resize-y rounded-xl border border-black/10 p-4 text-sm leading-6 outline-none focus:border-pink" />
        <div className={`mt-2 flex justify-between text-[10px] ${tooLong ? "font-bold text-red-600" : "text-black/40"}`}><span>Footer is added automatically</span><span>{prepared.length}/{MARKETING_SMS_MAX_LENGTH}</span></div>
        <div className="mt-4 rounded-xl bg-cream p-4 text-xs leading-5 text-black/55"><strong className="block text-black">Message preview</strong><p className="mt-2 whitespace-pre-wrap">{message.trim() || "Your message will appear here."}</p><p className="mt-2 whitespace-pre-wrap">{MARKETING_SMS_FOOTER}</p></div>
        <button type="button" onClick={() => setReviewing(true)} disabled={sending || !selected.length || !message.trim() || tooLong} className="button-primary mt-5 flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"><Send size={15} />{sending ? "Sending..." : `Review campaign for ${selected.length}`}</button>
        <p className="mt-3 text-[10px] leading-4 text-black/40">Consent and STOP status are checked again immediately before each message is sent.</p>
        {result && <p role="status" className="mt-4 rounded-xl bg-pink-light p-3 text-xs font-bold text-black/70">{result}</p>}
      </section>
      {reviewing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="campaign-review-title">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-pink">Step 1 of 2 · Review</p>
                <h2 id="campaign-review-title" className="mt-2 font-display text-4xl">Check before sending</h2>
              </div>
              <button type="button" onClick={() => setReviewing(false)} className="grid h-10 w-10 place-items-center rounded-full border border-black/10" aria-label="Close campaign review"><X size={18} /></button>
            </div>
            <div className="mt-5 rounded-xl bg-cream p-4 text-sm leading-6">
              <strong className="block text-xs uppercase tracking-[.12em] text-black/45">Final SMS</strong>
              <p className="mt-3 whitespace-pre-wrap">{prepared}</p>
              <p className="mt-3 text-[10px] text-black/40">{prepared.length} characters</p>
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <strong className="text-sm">Recipients</strong>
                <span className="rounded-full bg-pink-light px-3 py-1 text-xs font-bold text-pink">{selectedRecipients.length} selected</span>
              </div>
              <div className="mt-3 max-h-52 overflow-y-auto rounded-xl border border-black/5">
                {selectedRecipients.map((recipient) => <div key={recipient.id} className="flex justify-between gap-4 border-b border-black/5 px-4 py-3 text-xs last:border-0"><strong>{recipient.name}</strong><span className="text-black/45">{recipient.phone}</span></div>)}
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setReviewing(false)} disabled={sending} className="rounded-full border border-black/10 px-5 py-3 text-xs font-bold">Go back and edit</button>
              <button type="button" onClick={sendCampaign} disabled={sending} className="button-primary flex items-center justify-center gap-2 disabled:opacity-50"><Send size={15} />{sending ? "Sending..." : "Confirm and send"}</button>
            </div>
            <p className="mt-3 text-right text-[10px] text-black/40">Step 2 asks for one final confirmation before sending.</p>
          </div>
        </div>
      )}
    </div>
  );
}

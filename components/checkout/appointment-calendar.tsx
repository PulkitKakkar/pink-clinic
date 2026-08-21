"use client";

import { CalendarDays, Check, Clock, LoaderCircle, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type CustomerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type AppointmentDetails = {
  branchId: string;
  branchName: string;
  branchAddress: string;
  serviceId: string;
  treatmentName: string;
  durationMinutes: number;
  customer: CustomerDetails;
  paymentReference: string;
};

type ConfirmedBooking = {
  id: string;
  startsAt: string;
  endsAt: string;
  treatmentName: string;
};

const localDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function AppointmentCalendar({ details, onContinue, continueLabel = "Book next treatment" }: { details: AppointmentDetails; onContinue?: () => void; continueLabel?: string }) {
  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return localDate(date);
  }, []);
  const maximumDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 60);
    return localDate(date);
  }, []);
  const [date, setDate] = useState(tomorrow);
  const [slots, setSlots] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<ConfirmedBooking | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({
      branchId: details.branchId,
      serviceId: details.serviceId,
      durationMinutes: String(details.durationMinutes),
      date,
    });
    fetch(`/api/bookings/availability?${query}`, { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as { slots?: string[]; error?: string };
        if (!response.ok) throw new Error(body.error || "Could not load times.");
        setSlots(body.slots || []);
        setError("");
      })
      .catch((reason) => {
        if (reason instanceof Error && reason.name !== "AbortError")
          setError(reason.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [date, details.branchId, details.durationMinutes, details.serviceId, refresh]);

  async function confirmAppointment() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: details.branchId,
          serviceId: details.serviceId,
          treatmentName: details.treatmentName,
          durationMinutes: details.durationMinutes,
          startsAt: selected,
          customerName: `${details.customer.firstName} ${details.customer.lastName}`,
          customerEmail: details.customer.email,
          customerPhone: details.customer.phone,
          paymentReference: details.paymentReference,
        }),
      });
      const body = (await response.json()) as { booking?: ConfirmedBooking; error?: string };
      if (!response.ok || !body.booking)
        throw new Error(body.error || "Could not confirm the appointment.");
      setConfirmed(body.booking);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not confirm the appointment.");
      setSelected("");
      setLoading(true);
      setRefresh((value) => value + 1);
    } finally {
      setSaving(false);
    }
  }

  if (confirmed) {
    const start = new Date(confirmed.startsAt);
    return (
      <div className="rounded-[2rem] border border-emerald-200 bg-white p-6 text-center shadow-luxe sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check size={30} strokeWidth={2.5} /></span>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[.25em] text-emerald-700">Appointment confirmed</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">You’re booked with Pink.</h1>
        <p className="mt-4 text-base font-bold">{start.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" })}</p>
        <p className="mt-1 text-2xl font-bold text-pink">{start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })}</p>
        <div className="mt-6 grid gap-3 rounded-2xl bg-cream p-5 text-left text-sm sm:grid-cols-2">
          <p><strong className="block">Treatment</strong><span className="text-black/60">{confirmed.treatmentName}</span></p>
          <p><strong className="block">Location</strong><span className="text-black/60">{details.branchName}</span></p>
        </div>
        <p className="mt-5 text-xs leading-5 text-black/55">Pink will assign the right practitioner. Your appointment is already visible in the admin calendar, and confirmation will be sent using the contact details provided.</p>
        {onContinue && <button type="button" onClick={onContinue} className="button-primary mt-6 w-full">{continueLabel}</button>}
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-luxe sm:p-9">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pink-light text-pink"><CalendarDays size={21} /></span>
        <div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-pink">Payment approved · Next step</p><h1 className="mt-1 font-display text-4xl sm:text-5xl">Choose your appointment.</h1><p className="mt-2 text-sm leading-6 text-black/55">Select a date and time. Pink will assign the most suitable available practitioner.</p></div>
      </div>
      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-cream p-4 text-xs leading-5"><MapPin size={16} className="mt-0.5 shrink-0 text-pink" /><span><strong className="block">{details.branchName}</strong>{details.branchAddress}</span></div>
      <label className="mt-6 grid gap-2 text-xs font-bold">Appointment date<input type="date" value={date} min={localDate(new Date())} max={maximumDate} onChange={(event) => { setDate(event.target.value); setSelected(""); setLoading(true); setError(""); }} className="min-h-12 rounded-xl border border-black/15 bg-cream px-4 text-base outline-none focus:border-pink" /></label>
      <fieldset className="mt-6"><legend className="text-xs font-bold">Available times</legend>
        {loading ? <p className="mt-4 flex items-center gap-2 text-sm text-black/55"><LoaderCircle size={16} className="animate-spin" /> Checking the admin calendar…</p> : slots.length ? <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{slots.map((slot) => <button key={slot} type="button" aria-pressed={selected === slot} onClick={() => setSelected(slot)} className={`min-h-11 rounded-xl border px-2 text-sm font-bold transition ${selected === slot ? "border-pink bg-pink text-white" : "border-black/10 bg-white hover:border-pink hover:text-pink"}`}><Clock size={13} className="mr-1 inline" />{new Date(slot).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })}</button>)}</div> : <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">No times are available on this date. Please choose another day.</p>}
      </fieldset>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
      <button type="button" disabled={!selected || saving} onClick={confirmAppointment} className="button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-45">{saving ? <><LoaderCircle size={16} className="animate-spin" /> Confirming…</> : "Confirm appointment"}</button>
      <p className="mt-3 text-center text-[10px] leading-4 text-black/45">Times are live and may be taken by another customer until confirmed.</p>
    </div>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock, Columns3, LoaderCircle, MapPin, Pencil, Plus, UserRound, X, XCircle } from "lucide-react";
import type { Booking, BookingStatus, StaffMember } from "@/lib/admin/booking-types";
import type { Branch } from "@/lib/branches";
import type { Service } from "@/lib/content";

const MANUAL = "manual";
const inputClass = "w-full rounded-xl border border-black/10 bg-cream px-4 py-3 text-sm outline-none focus:border-pink";
const statusStyle: Record<BookingStatus, string> = { confirmed: "bg-pink-light text-pink-dark", completed: "bg-green-50 text-green-700", cancelled: "bg-black/5 text-black/40", "no-show": "bg-red-50 text-red-700" };
const branchStyle: Record<string, string> = { "reading-west-street": "border-l-pink", "reading-watlington-street": "border-l-[#7b3ff2]" };
const localDate = (date: Date) => date.toLocaleDateString("en-CA");
const localDateTime = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
const startOfWeek = (date: Date) => { const day = new Date(date); const weekday = day.getDay() || 7; day.setDate(day.getDate() - weekday + 1); day.setHours(0, 0, 0, 0); return day; };
const startOfMonthGrid = (date: Date) => startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1));
const addDays = (date: Date, amount: number) => { const next = new Date(date); next.setDate(next.getDate() + amount); return next; };
const addMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, 1);

type Props = { initialBookings: Booking[]; branches: Branch[]; services: Service[]; staff: StaffMember[] };
type CalendarView = "month" | "week" | "day";
type Message = { type: "idle" | "saving" | "success" | "warning" | "error"; message?: string };
type BookingResponse = { booking?: Booking; notification?: { sent: boolean; reason?: string }; error?: string };

export function BookingCalendar({ initialBookings, branches, services, staff }: Props) {
  const [bookings, setBookings] = useState(initialBookings);
  const [view, setView] = useState<CalendarView>("week");
  const [cursorDate, setCursorDate] = useState(new Date());
  const [branchFilter, setBranchFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [formBranch, setFormBranch] = useState(branches[0]?.id || "");
  const [formService, setFormService] = useState(services[0]?.id || "");
  const [formStaff, setFormStaff] = useState("");
  const [formTreatmentName, setFormTreatmentName] = useState("");
  const [formPractitionerName, setFormPractitionerName] = useState("");
  const [formStartsAt, setFormStartsAt] = useState("");
  const [editing, setEditing] = useState<Booking | null>(null);
  const [editBranch, setEditBranch] = useState("");
  const [editService, setEditService] = useState("");
  const [editStaff, setEditStaff] = useState("");
  const [message, setMessage] = useState<Message>({ type: "idle" });
  const [editMessage, setEditMessage] = useState<Message>({ type: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  const weekStart = useMemo(() => startOfWeek(cursorDate), [cursorDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const monthDays = useMemo(() => Array.from({ length: 42 }, (_, index) => addDays(startOfMonthGrid(cursorDate), index)), [cursorDate]);
  const eligibleStaff = useMemo(() => staff.filter((member) => member.branchIds.includes(formBranch) && (formService === MANUAL || member.serviceIds.includes(formService))), [formBranch, formService, staff]);
  const editEligibleStaff = useMemo(() => staff.filter((member) => member.branchIds.includes(editBranch) && (editService === MANUAL || member.serviceIds.includes(editService))), [editBranch, editService, staff]);
  const filteredBookings = useMemo(() => bookings.filter((booking) => (branchFilter === "all" || booking.branchId === branchFilter) && (staffFilter === "all" || booking.staffId === staffFilter)), [bookings, branchFilter, staffFilter]);

  const title = view === "month"
    ? cursorDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : view === "day"
      ? cursorDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : `${weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${addDays(weekStart, 6).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  function openEdit(booking: Booking) {
    setEditing(booking);
    setEditBranch(booking.branchId);
    setEditService(booking.serviceId);
    setEditStaff(booking.staffId.startsWith("manual:") ? MANUAL : booking.staffId);
    setEditMessage({ type: "idle" });
  }

  function bookingsForDay(day: Date) {
    return filteredBookings.filter((booking) => localDate(new Date(booking.startsAt)) === localDate(day)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  function selectNewBookingSlot(day: Date, hour = 9, minute = 0) {
    const selected = new Date(day);
    selected.setHours(hour, minute, 0, 0);
    setCursorDate(selected);
    setFormStartsAt(localDateTime(selected));
    setMessage({ type: "success", message: `New booking time selected for ${selected.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} at ${selected.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.` });
    window.requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function moveCursor(amount: number) {
    setCursorDate((current) => view === "month" ? addMonths(current, amount) : addDays(current, amount * (view === "week" ? 7 : 1)));
  }

  async function save(body: Record<string, unknown>, setter: React.Dispatch<React.SetStateAction<Message>>) {
    setter({ type: "saving" });
    const response = await fetch("/api/admin/bookings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json() as BookingResponse;
    if (!response.ok || !result.booking) { setter({ type: "error", message: result.error || "Could not update booking." }); return undefined; }
    setBookings((current) => current.map((booking) => booking.id === result.booking!.id ? result.booking! : booking));
    setter(result.notification && !result.notification.sent
      ? { type: "warning", message: `Booking updated, but customer notification was not sent: ${result.notification.reason || "provider unavailable"}` }
      : { type: "success", message: "Booking updated." });
    return result.booking;
  }

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage({ type: "saving" });
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/bookings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ branchId: form.get("branchId"), serviceId: form.get("serviceId"), treatmentName: form.get("treatmentName"), durationMinutes: Number(form.get("durationMinutes")), staffId: form.get("staffId"), practitionerName: form.get("practitionerName"), customerName: form.get("customerName"), customerEmail: form.get("customerEmail"), customerPhone: form.get("customerPhone"), marketingConsent: form.get("marketingConsent") === "on", startsAt: new Date(String(form.get("startsAt"))).toISOString(), notes: form.get("notes") }) });
    const result = await response.json() as BookingResponse;
    if (!response.ok || !result.booking) { setMessage({ type: "error", message: result.error || "Could not create booking." }); return; }
    setBookings((current) => [...current, result.booking!]); setCursorDate(new Date(result.booking.startsAt)); setMessage(result.notification && !result.notification.sent
      ? { type: "warning", message: `Booking created, but customer confirmation was not sent: ${result.notification.reason || "provider unavailable"}` }
      : { type: "success", message: "Booking created and customer confirmation sent." });
    event.currentTarget.reset(); setFormBranch(branches[0]?.id || ""); setFormService(services[0]?.id || ""); setFormStaff(""); setFormTreatmentName(""); setFormPractitionerName(""); setFormStartsAt("");
  }

  async function submitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return;
    const form = new FormData(event.currentTarget);
    const updated = await save({ id: editing.id, branchId: form.get("branchId"), serviceId: form.get("serviceId"), treatmentName: form.get("treatmentName"), durationMinutes: Number(form.get("durationMinutes")), staffId: form.get("staffId"), practitionerName: form.get("practitionerName"), customerName: form.get("customerName"), customerEmail: form.get("customerEmail"), customerPhone: form.get("customerPhone"), marketingConsent: form.get("marketingConsent") === "true", marketingConsentUpdatedAt: form.get("marketingConsent") === String(editing.marketingConsent) ? editing.marketingConsentUpdatedAt : new Date().toISOString(), startsAt: new Date(String(form.get("startsAt"))).toISOString(), status: form.get("status"), notes: form.get("notes") }, setEditMessage);
    if (updated) window.setTimeout(() => setEditing(null), 450);
  }

  return <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
    <form ref={formRef} onSubmit={create} className="h-fit rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7">
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-pink text-white"><Plus size={18} /></span><div><h2 className="font-display text-2xl">New booking</h2><p className="text-[10px] text-black/40">Click a calendar day or time slot to prefill this form</p></div></div>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-xs font-bold">Branch<select name="branchId" value={formBranch} onChange={(e) => { setFormBranch(e.target.value); setFormStaff(""); }} className={inputClass}>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
        <label className="grid gap-2 text-xs font-bold">Treatment<select name="serviceId" value={formService} onChange={(e) => { setFormService(e.target.value); setFormStaff(""); }} className={inputClass}>{services.map((service) => <option key={service.id} value={service.id}>{service.title} · {service.duration}</option>)}<option value={MANUAL}>Other / enter manually</option></select></label>
        {formService === MANUAL && <div className="grid grid-cols-[1fr_110px] gap-3"><label className="grid gap-2 text-xs font-bold">Treatment name<input required name="treatmentName" value={formTreatmentName} onChange={(e) => setFormTreatmentName(e.target.value)} className={inputClass} /></label><label className="grid gap-2 text-xs font-bold">Minutes<input required name="durationMinutes" type="number" min="5" max="480" step="5" defaultValue="60" className={inputClass} /></label></div>}
        <label className="grid gap-2 text-xs font-bold">Practitioner<select required name="staffId" value={formStaff} onChange={(e) => setFormStaff(e.target.value)} className={inputClass}><option value="">Select practitioner</option>{eligibleStaff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}<option value={MANUAL}>Other / enter manually</option></select></label>
        {formStaff === MANUAL && <label className="grid gap-2 text-xs font-bold">Practitioner name<input required name="practitionerName" value={formPractitionerName} onChange={(e) => setFormPractitionerName(e.target.value)} className={inputClass} /></label>}
        <label className="grid gap-2 text-xs font-bold">Date and start time<input name="startsAt" required type="datetime-local" value={formStartsAt} onChange={(event) => setFormStartsAt(event.target.value)} className={inputClass} /></label>
        <label className="grid gap-2 text-xs font-bold">Customer name<input name="customerName" required className={inputClass} /></label><label className="grid gap-2 text-xs font-bold">Customer phone<input name="customerPhone" required type="tel" className={inputClass} /></label><label className="grid gap-2 text-xs font-bold">Customer email<input name="customerEmail" type="email" className={inputClass} /></label><label className="flex items-start gap-3 rounded-xl border border-black/5 bg-pink-light/35 p-4 text-xs leading-5"><input name="marketingConsent" type="checkbox" className="mt-1 accent-pink" /><span><strong className="block">Customer agrees to promotional messages</strong>Optional GDPR consent for future offers by SMS or email. Leave unticked if they say no.</span></label><label className="grid gap-2 text-xs font-bold">Appointment notes<textarea name="notes" rows={3} placeholder="What was done, products used, aftercare, follow-up needs" className={inputClass} /></label>
        {message.type !== "idle" && <MessageBox message={message} />}<button disabled={message.type === "saving"} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-70" type="submit">{message.type === "saving" && <LoaderCircle className="animate-spin" size={15} />} {message.type === "saving" ? "Creating booking..." : "Create booking"}</button>
      </div>
    </form>

    <section className="min-w-0 rounded-2xl border border-black/5 bg-white p-4 shadow-soft sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-pink">Appointment calendar</p>
          <h2 className="mt-2 font-display text-3xl">{view === "month" ? "Monthly schedule" : view === "day" ? "Daily schedule" : "Weekly schedule"}</h2>
          <p className="mt-1 text-xs text-black/40">{title}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => moveCursor(-1)} className="grid h-11 w-11 place-items-center rounded-xl border border-black/10"><ArrowLeft size={16} /></button>
          <button type="button" onClick={() => setCursorDate(new Date())} className="rounded-xl border border-black/10 px-4 text-xs font-bold">Today</button>
          <button type="button" onClick={() => moveCursor(1)} className="grid h-11 w-11 place-items-center rounded-xl border border-black/10"><ArrowRight size={16} /></button>
          <div className="inline-flex rounded-xl border border-black/10 bg-white p-1">
            <ViewButton active={view === "month"} icon={<CalendarDays size={14} />} label="Month" onClick={() => setView("month")} />
            <ViewButton active={view === "week"} icon={<Columns3 size={14} />} label="Week" onClick={() => setView("week")} />
            <ViewButton active={view === "day"} icon={<Clock size={14} />} label="Day" onClick={() => setView("day")} />
          </div>
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className={inputClass}><option value="all">Both branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select>
          <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)} className={inputClass}><option value="all">All staff</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select>
        </div>
      </div>

      {view === "month" && <MonthView days={monthDays} cursorDate={cursorDate} bookingsForDay={bookingsForDay} branches={branches} onSelectDay={selectNewBookingSlot} onEdit={openEdit} />}
      {view === "week" && <WeekView days={weekDays} bookingsForDay={bookingsForDay} branches={branches} onSelectDay={selectNewBookingSlot} onEdit={openEdit} />}
      {view === "day" && <DayView day={cursorDate} bookings={bookingsForDay(cursorDate)} branches={branches} onSelectSlot={selectNewBookingSlot} onEdit={openEdit} />}

      <div className="mt-3 flex flex-wrap gap-4 text-[9px] font-bold uppercase tracking-[.12em] text-black/40"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-pink" />West Street</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#7b3ff2]" />Watlington Street</span><span>Click a day, time slot, or booking</span></div>
    </section>

    {editing && <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#16010d]/75 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><form onSubmit={submitEdit} className="mx-auto my-8 max-w-xl rounded-2xl bg-white p-5 shadow-luxe sm:p-8"><div className="flex items-start justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-pink">Edit appointment</p><h2 className="mt-1 font-display text-3xl">{editing.customerName}</h2></div><button type="button" onClick={() => setEditing(null)} className="p-2"><X size={18} /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold">Branch<select name="branchId" value={editBranch} onChange={(e) => setEditBranch(e.target.value)} className={inputClass}>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label><label className="grid gap-2 text-xs font-bold">Treatment<select name="serviceId" value={editService} onChange={(e) => setEditService(e.target.value)} className={inputClass}>{services.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}<option value={MANUAL}>Other / enter manually</option></select></label>{editService === MANUAL && <><label className="grid gap-2 text-xs font-bold">Treatment name<input required name="treatmentName" defaultValue={editing.treatmentName} className={inputClass} /></label><label className="grid gap-2 text-xs font-bold">Duration in minutes<input required name="durationMinutes" type="number" min="5" max="480" step="5" defaultValue={editing.durationMinutes} className={inputClass} /></label></>}<label className="grid gap-2 text-xs font-bold">Practitioner<select name="staffId" value={editStaff} onChange={(e) => setEditStaff(e.target.value)} className={inputClass}>{editEligibleStaff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}<option value={MANUAL}>Other / enter manually</option></select></label>{editStaff === MANUAL && <label className="grid gap-2 text-xs font-bold">Practitioner name<input required name="practitionerName" defaultValue={editing.practitionerName} className={inputClass} /></label>}<label className="grid gap-2 text-xs font-bold">Status<select name="status" defaultValue={editing.status} className={inputClass}>{(["confirmed", "completed", "cancelled", "no-show"] as BookingStatus[]).map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label className="grid gap-2 text-xs font-bold sm:col-span-2">Date and start time<input name="startsAt" type="datetime-local" required defaultValue={localDateTime(new Date(editing.startsAt))} className={inputClass} /></label><label className="grid gap-2 text-xs font-bold">Customer name<input name="customerName" required defaultValue={editing.customerName} className={inputClass} /></label><label className="grid gap-2 text-xs font-bold">Customer phone<input name="customerPhone" required defaultValue={editing.customerPhone} className={inputClass} /></label><label className="grid gap-2 text-xs font-bold sm:col-span-2">Customer email<input name="customerEmail" type="email" defaultValue={editing.customerEmail} className={inputClass} /></label><label className="grid gap-2 text-xs font-bold sm:col-span-2">Promotional consent<select name="marketingConsent" defaultValue={String(editing.marketingConsent)} className={inputClass}><option value="false">No promotional SMS or email</option><option value="true">Yes, customer opted in</option></select><span className="text-[10px] font-medium text-black/40">Only opted-in customers should be included in future promotional sends.</span></label><label className="grid gap-2 text-xs font-bold sm:col-span-2">Appointment notes<textarea name="notes" rows={5} defaultValue={editing.notes} placeholder="What was done, products used, aftercare, follow-up needs" className={inputClass} /></label></div>{editMessage.type !== "idle" && <div className="mt-4"><MessageBox message={editMessage} /></div>}<div className="mt-5 flex flex-wrap gap-2"><button className="button-primary disabled:cursor-not-allowed disabled:opacity-70" disabled={editMessage.type === "saving"} type="submit">{editMessage.type === "saving" ? <LoaderCircle className="animate-spin" size={14} /> : <Pencil size={14} />} {editMessage.type === "saving" ? "Saving changes..." : "Save changes"}</button>{editing.status === "confirmed" && <><button type="button" disabled={editMessage.type === "saving"} onClick={() => save({ id: editing.id, status: "completed" }, setEditMessage)} className="inline-flex items-center gap-2 rounded-full border border-green-200 px-5 py-3 text-xs font-bold text-green-700 disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 size={14} /> Complete</button><button type="button" disabled={editMessage.type === "saving"} onClick={() => save({ id: editing.id, status: "cancelled" }, setEditMessage)} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-3 text-xs font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"><XCircle size={14} /> Cancel</button></>}</div></form></div>}
  </div>;
}

function MonthView({ days, cursorDate, bookingsForDay, branches, onSelectDay, onEdit }: { days: Date[]; cursorDate: Date; bookingsForDay: (day: Date) => Booking[]; branches: Branch[]; onSelectDay: (day: Date) => void; onEdit: (booking: Booking) => void }) {
  return <div className="mt-6 overflow-x-auto pb-2"><div className="grid min-w-[980px] grid-cols-7 gap-2">{days.map((day) => {
    const dayItems = bookingsForDay(day);
    const muted = day.getMonth() !== cursorDate.getMonth();
    return <div key={day.toISOString()} role="button" tabIndex={0} onClick={() => onSelectDay(day)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelectDay(day); }} className={`min-h-[150px] rounded-xl border border-black/5 bg-cream/60 p-2 text-left transition hover:border-pink/30 hover:bg-pink-light/40 ${muted ? "opacity-45" : ""}`}>
      <DayHeader day={day} />
      <div className="mt-2 grid gap-1.5">{dayItems.slice(0, 3).map((booking) => <BookingCard key={booking.id} booking={booking} branches={branches} compact onEdit={(event) => { event.stopPropagation(); onEdit(booking); }} />)}{dayItems.length > 3 && <span className="px-2 text-[8px] font-bold text-black/35">+{dayItems.length - 3} more</span>}{!dayItems.length && <span className="inline-flex items-center gap-1 px-2 py-3 text-[9px] text-black/25"><Plus size={10} /> Add booking</span>}</div>
    </div>;
  })}</div></div>;
}

function WeekView({ days, bookingsForDay, branches, onSelectDay, onEdit }: { days: Date[]; bookingsForDay: (day: Date) => Booking[]; branches: Branch[]; onSelectDay: (day: Date) => void; onEdit: (booking: Booking) => void }) {
  return <div className="mt-6 overflow-x-auto pb-2"><div className="grid min-w-[980px] grid-cols-7 gap-2">{days.map((day) => {
    const dayItems = bookingsForDay(day);
    return <div key={day.toISOString()} role="button" tabIndex={0} onClick={() => onSelectDay(day)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelectDay(day); }} className="min-h-[440px] rounded-xl bg-cream/60 p-2 text-left transition hover:bg-pink-light/40">
      <DayHeader day={day} />
      <div className="mt-2 grid gap-2">{dayItems.map((booking) => <BookingCard key={booking.id} booking={booking} branches={branches} onEdit={(event) => { event.stopPropagation(); onEdit(booking); }} />)}{!dayItems.length && <span className="inline-flex items-center justify-center gap-1 px-2 py-4 text-center text-[9px] text-black/25"><Plus size={10} /> Add booking</span>}</div>
    </div>;
  })}</div></div>;
}

function DayView({ day, bookings, branches, onSelectSlot, onEdit }: { day: Date; bookings: Booking[]; branches: Branch[]; onSelectSlot: (day: Date, hour: number) => void; onEdit: (booking: Booking) => void }) {
  const hours = Array.from({ length: 13 }, (_, index) => index + 8);
  return <div className="mt-6 grid gap-2">{hours.map((hour) => {
    const slotBookings = bookings.filter((booking) => new Date(booking.startsAt).getHours() === hour);
    return <div key={hour} role="button" tabIndex={0} onClick={() => onSelectSlot(day, hour)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelectSlot(day, hour); }} className="grid min-h-20 grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-xl border border-black/5 bg-cream/60 p-3 text-left transition hover:border-pink/30 hover:bg-pink-light/40">
      <span className="text-xs font-bold text-black/45">{String(hour).padStart(2, "0")}:00</span>
      <span className="grid gap-2">{slotBookings.map((booking) => <BookingCard key={booking.id} booking={booking} branches={branches} onEdit={(event) => { event.stopPropagation(); onEdit(booking); }} />)}{!slotBookings.length && <span className="inline-flex items-center gap-1 text-[9px] text-black/25"><Plus size={10} /> Add booking here</span>}</span>
    </div>;
  })}</div>;
}

function ViewButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold ${active ? "bg-pink text-white" : "text-black/55 hover:bg-cream"}`}>{icon}{label}</button>;
}

function DayHeader({ day }: { day: Date }) {
  return <div className={`rounded-lg px-2 py-2 ${localDate(day) === localDate(new Date()) ? "bg-pink text-white" : "bg-white"}`}><p className="text-[8px] font-bold uppercase tracking-[.14em]">{day.toLocaleDateString("en-GB", { weekday: "short" })}</p><p className="font-display text-2xl">{day.getDate()}</p></div>;
}

function MessageBox({ message }: { message: Message }) { return <p className={`rounded-xl p-3 text-xs font-bold ${message.type === "error" ? "bg-red-50 text-red-700" : message.type === "warning" ? "bg-amber-50 text-amber-900" : message.type === "success" ? "bg-green-50 text-green-700" : "bg-pink-light text-pink-dark"}`}>{message.message || "Saving..."}</p>; }

function BookingCard({ booking, branches, compact, onEdit }: { booking: Booking; branches: Branch[]; compact?: boolean; onEdit: (event: React.MouseEvent<HTMLButtonElement>) => void }) {
  const branch = branches.find((item) => item.id === booking.branchId);
  return <button type="button" onClick={onEdit} className={`w-full rounded-lg border border-black/5 border-l-4 bg-white p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${branchStyle[booking.branchId] || "border-l-black"} ${booking.status === "cancelled" ? "opacity-45" : ""}`}><div className="flex items-center justify-between gap-1"><span className="text-[9px] font-bold">{new Date(booking.startsAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span><span className={`rounded-full px-1.5 py-0.5 text-[6px] font-bold uppercase ${statusStyle[booking.status]}`}>{booking.status}</span></div><p className={`mt-1.5 line-clamp-1 font-display leading-none ${compact ? "text-sm" : "text-lg"}`}>{booking.customerName}</p><p className="mt-1 line-clamp-1 text-[8px] font-bold text-pink">{booking.treatmentName}</p>{!compact && <div className="mt-2 grid gap-1 text-[7px] text-black/40"><span className="flex items-center gap-1"><MapPin size={8} />{branch?.name}</span><span className="flex items-center gap-1"><UserRound size={8} />{booking.practitionerName}</span>{booking.notes && <span className="line-clamp-1">Note: {booking.notes}</span>}</div>}</button>;
}

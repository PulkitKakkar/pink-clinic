"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Pencil, Plus, UserRound, X, XCircle } from "lucide-react";
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
const addDays = (date: Date, amount: number) => { const next = new Date(date); next.setDate(next.getDate() + amount); return next; };

type Props = { initialBookings: Booking[]; branches: Branch[]; services: Service[]; staff: StaffMember[] };
type Message = { type: "idle" | "saving" | "success" | "warning" | "error"; message?: string };
type BookingResponse = { booking?: Booking; notification?: { sent: boolean; reason?: string }; error?: string };

export function BookingCalendar({ initialBookings, branches, services, staff }: Props) {
  const [bookings, setBookings] = useState(initialBookings);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [branchFilter, setBranchFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [formBranch, setFormBranch] = useState(branches[0]?.id || "");
  const [formService, setFormService] = useState(services[0]?.id || "");
  const [formStaff, setFormStaff] = useState("");
  const [formTreatmentName, setFormTreatmentName] = useState("");
  const [formPractitionerName, setFormPractitionerName] = useState("");
  const [editing, setEditing] = useState<Booking | null>(null);
  const [editBranch, setEditBranch] = useState("");
  const [editService, setEditService] = useState("");
  const [editStaff, setEditStaff] = useState("");
  const [message, setMessage] = useState<Message>({ type: "idle" });
  const [editMessage, setEditMessage] = useState<Message>({ type: "idle" });

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const eligibleStaff = useMemo(() => staff.filter((member) => member.branchIds.includes(formBranch) && (formService === MANUAL || member.serviceIds.includes(formService))), [formBranch, formService, staff]);
  const editEligibleStaff = useMemo(() => staff.filter((member) => member.branchIds.includes(editBranch) && (editService === MANUAL || member.serviceIds.includes(editService))), [editBranch, editService, staff]);
  const filteredBookings = useMemo(() => bookings.filter((booking) => (branchFilter === "all" || booking.branchId === branchFilter) && (staffFilter === "all" || booking.staffId === staffFilter)), [bookings, branchFilter, staffFilter]);

  function openEdit(booking: Booking) {
    setEditing(booking);
    setEditBranch(booking.branchId);
    setEditService(booking.serviceId);
    setEditStaff(booking.staffId.startsWith("manual:") ? MANUAL : booking.staffId);
    setEditMessage({ type: "idle" });
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
    const response = await fetch("/api/admin/bookings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ branchId: form.get("branchId"), serviceId: form.get("serviceId"), treatmentName: form.get("treatmentName"), durationMinutes: Number(form.get("durationMinutes")), staffId: form.get("staffId"), practitionerName: form.get("practitionerName"), customerName: form.get("customerName"), customerEmail: form.get("customerEmail"), customerPhone: form.get("customerPhone"), startsAt: new Date(String(form.get("startsAt"))).toISOString(), notes: form.get("notes") }) });
    const result = await response.json() as BookingResponse;
    if (!response.ok || !result.booking) { setMessage({ type: "error", message: result.error || "Could not create booking." }); return; }
    setBookings((current) => [...current, result.booking!]); setWeekStart(startOfWeek(new Date(result.booking.startsAt))); setMessage(result.notification && !result.notification.sent
      ? { type: "warning", message: `Booking created, but customer confirmation was not sent: ${result.notification.reason || "provider unavailable"}` }
      : { type: "success", message: "Booking created and customer confirmation sent." });
    event.currentTarget.reset(); setFormBranch(branches[0]?.id || ""); setFormService(services[0]?.id || ""); setFormStaff(""); setFormTreatmentName(""); setFormPractitionerName("");
  }

  async function submitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return;
    const form = new FormData(event.currentTarget);
    const updated = await save({ id: editing.id, branchId: form.get("branchId"), serviceId: form.get("serviceId"), treatmentName: form.get("treatmentName"), durationMinutes: Number(form.get("durationMinutes")), staffId: form.get("staffId"), practitionerName: form.get("practitionerName"), customerName: form.get("customerName"), customerEmail: form.get("customerEmail"), customerPhone: form.get("customerPhone"), startsAt: new Date(String(form.get("startsAt"))).toISOString(), status: form.get("status"), notes: form.get("notes") }, setEditMessage);
    if (updated) window.setTimeout(() => setEditing(null), 450);
  }

  return <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
    <form onSubmit={create} className="h-fit rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7">
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-pink text-white"><Plus size={18} /></span><div><h2 className="font-display text-2xl">New booking</h2><p className="text-[10px] text-black/40">Admin-created appointment</p></div></div>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-xs font-bold">Branch<select name="branchId" value={formBranch} onChange={(e) => { setFormBranch(e.target.value); setFormStaff(""); }} className={inputClass}>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
        <label className="grid gap-2 text-xs font-bold">Treatment<select name="serviceId" value={formService} onChange={(e) => { setFormService(e.target.value); setFormStaff(""); }} className={inputClass}>{services.map((service) => <option key={service.id} value={service.id}>{service.title} · {service.duration}</option>)}<option value={MANUAL}>Other / enter manually</option></select></label>
        {formService === MANUAL && <div className="grid grid-cols-[1fr_110px] gap-3"><label className="grid gap-2 text-xs font-bold">Treatment name<input required name="treatmentName" value={formTreatmentName} onChange={(e) => setFormTreatmentName(e.target.value)} className={inputClass} /></label><label className="grid gap-2 text-xs font-bold">Minutes<input required name="durationMinutes" type="number" min="5" max="480" step="5" defaultValue="60" className={inputClass} /></label></div>}
        <label className="grid gap-2 text-xs font-bold">Practitioner<select required name="staffId" value={formStaff} onChange={(e) => setFormStaff(e.target.value)} className={inputClass}><option value="">Select practitioner</option>{eligibleStaff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}<option value={MANUAL}>Other / enter manually</option></select></label>
        {formStaff === MANUAL && <label className="grid gap-2 text-xs font-bold">Practitioner name<input required name="practitionerName" value={formPractitionerName} onChange={(e) => setFormPractitionerName(e.target.value)} className={inputClass} /></label>}
        <label className="grid gap-2 text-xs font-bold">Date and start time<input name="startsAt" required type="datetime-local" min={localDateTime(new Date())} className={inputClass} /></label>
        <label className="grid gap-2 text-xs font-bold">Customer name<input name="customerName" required className={inputClass} /></label><label className="grid gap-2 text-xs font-bold">Customer phone<input name="customerPhone" required type="tel" className={inputClass} /></label><label className="grid gap-2 text-xs font-bold">Customer email<input name="customerEmail" type="email" className={inputClass} /></label><label className="grid gap-2 text-xs font-bold">Notes<textarea name="notes" rows={3} className={inputClass} /></label>
        {message.type !== "idle" && <MessageBox message={message} />}<button disabled={message.type === "saving"} className="button-primary w-full" type="submit">Create booking</button>
      </div>
    </form>

    <section className="min-w-0 rounded-2xl border border-black/5 bg-white p-4 shadow-soft sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-pink">Appointment calendar</p><h2 className="mt-2 font-display text-3xl">Weekly schedule</h2><p className="mt-1 text-xs text-black/40">{weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – {addDays(weekStart, 6).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setWeekStart(addDays(weekStart, -7))} className="grid h-11 w-11 place-items-center rounded-xl border border-black/10"><ArrowLeft size={16} /></button><button onClick={() => setWeekStart(startOfWeek(new Date()))} className="rounded-xl border border-black/10 px-4 text-xs font-bold">This week</button><button onClick={() => setWeekStart(addDays(weekStart, 7))} className="grid h-11 w-11 place-items-center rounded-xl border border-black/10"><ArrowRight size={16} /></button><select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className={inputClass}><option value="all">Both branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select><select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)} className={inputClass}><option value="all">All staff</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></div></div>
      <div className="mt-6 overflow-x-auto pb-2"><div className="grid min-w-[980px] grid-cols-7 gap-2">{weekDays.map((day) => { const dayItems = filteredBookings.filter((booking) => localDate(new Date(booking.startsAt)) === localDate(day)).sort((a, b) => a.startsAt.localeCompare(b.startsAt)); return <div key={day.toISOString()} className="min-h-[440px] rounded-xl bg-cream/60 p-2"><div className={`rounded-lg px-2 py-2 ${localDate(day) === localDate(new Date()) ? "bg-pink text-white" : "bg-white"}`}><p className="text-[8px] font-bold uppercase tracking-[.14em]">{day.toLocaleDateString("en-GB", { weekday: "short" })}</p><p className="font-display text-2xl">{day.getDate()}</p></div><div className="mt-2 grid gap-2">{dayItems.map((booking) => <BookingCard key={booking.id} booking={booking} branches={branches} onEdit={() => openEdit(booking)} />)}{!dayItems.length && <p className="px-2 py-4 text-center text-[9px] text-black/25">No bookings</p>}</div></div>; })}</div></div>
      <div className="mt-3 flex flex-wrap gap-4 text-[9px] font-bold uppercase tracking-[.12em] text-black/40"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-pink" />West Street</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#7b3ff2]" />Watlington Street</span><span>Click a booking to edit or add notes</span></div>
    </section>

    {editing && <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#16010d]/75 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><form onSubmit={submitEdit} className="mx-auto my-8 max-w-xl rounded-2xl bg-white p-5 shadow-luxe sm:p-8"><div className="flex items-start justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-pink">Edit appointment</p><h2 className="mt-1 font-display text-3xl">{editing.customerName}</h2></div><button type="button" onClick={() => setEditing(null)} className="p-2"><X size={18} /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold">Branch<select name="branchId" value={editBranch} onChange={(e) => setEditBranch(e.target.value)} className={inputClass}>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label><label className="grid gap-2 text-xs font-bold">Treatment<select name="serviceId" value={editService} onChange={(e) => setEditService(e.target.value)} className={inputClass}>{services.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}<option value={MANUAL}>Other / enter manually</option></select></label>{editService === MANUAL && <><label className="grid gap-2 text-xs font-bold">Treatment name<input required name="treatmentName" defaultValue={editing.treatmentName} className={inputClass} /></label><label className="grid gap-2 text-xs font-bold">Duration in minutes<input required name="durationMinutes" type="number" min="5" max="480" step="5" defaultValue={editing.durationMinutes} className={inputClass} /></label></>}<label className="grid gap-2 text-xs font-bold">Practitioner<select name="staffId" value={editStaff} onChange={(e) => setEditStaff(e.target.value)} className={inputClass}>{editEligibleStaff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}<option value={MANUAL}>Other / enter manually</option></select></label>{editStaff === MANUAL && <label className="grid gap-2 text-xs font-bold">Practitioner name<input required name="practitionerName" defaultValue={editing.practitionerName} className={inputClass} /></label>}<label className="grid gap-2 text-xs font-bold">Status<select name="status" defaultValue={editing.status} className={inputClass}>{(["confirmed", "completed", "cancelled", "no-show"] as BookingStatus[]).map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label className="grid gap-2 text-xs font-bold sm:col-span-2">Date and start time<input name="startsAt" type="datetime-local" required defaultValue={localDateTime(new Date(editing.startsAt))} className={inputClass} /></label><label className="grid gap-2 text-xs font-bold">Customer name<input name="customerName" required defaultValue={editing.customerName} className={inputClass} /></label><label className="grid gap-2 text-xs font-bold">Customer phone<input name="customerPhone" required defaultValue={editing.customerPhone} className={inputClass} /></label><label className="grid gap-2 text-xs font-bold sm:col-span-2">Customer email<input name="customerEmail" type="email" defaultValue={editing.customerEmail} className={inputClass} /></label><label className="grid gap-2 text-xs font-bold sm:col-span-2">Notes<textarea name="notes" rows={5} defaultValue={editing.notes} className={inputClass} /></label></div>{editMessage.type !== "idle" && <div className="mt-4"><MessageBox message={editMessage} /></div>}<div className="mt-5 flex flex-wrap gap-2"><button className="button-primary" type="submit"><Pencil size={14} /> Save changes</button>{editing.status === "confirmed" && <><button type="button" onClick={() => save({ id: editing.id, status: "completed" }, setEditMessage)} className="inline-flex items-center gap-2 rounded-full border border-green-200 px-5 py-3 text-xs font-bold text-green-700"><CheckCircle2 size={14} /> Complete</button><button type="button" onClick={() => save({ id: editing.id, status: "cancelled" }, setEditMessage)} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-3 text-xs font-bold text-red-700"><XCircle size={14} /> Cancel</button></>}</div></form></div>}
  </div>;
}

function MessageBox({ message }: { message: Message }) { return <p className={`rounded-xl p-3 text-xs font-bold ${message.type === "error" ? "bg-red-50 text-red-700" : message.type === "warning" ? "bg-amber-50 text-amber-900" : message.type === "success" ? "bg-green-50 text-green-700" : "bg-pink-light text-pink-dark"}`}>{message.message || "Saving..."}</p>; }

function BookingCard({ booking, branches, onEdit }: { booking: Booking; branches: Branch[]; onEdit: () => void }) {
  const branch = branches.find((item) => item.id === booking.branchId);
  return <button onClick={onEdit} className={`w-full rounded-lg border border-black/5 border-l-4 bg-white p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${branchStyle[booking.branchId] || "border-l-black"} ${booking.status === "cancelled" ? "opacity-45" : ""}`}><div className="flex items-center justify-between gap-1"><span className="text-[9px] font-bold">{new Date(booking.startsAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span><span className={`rounded-full px-1.5 py-0.5 text-[6px] font-bold uppercase ${statusStyle[booking.status]}`}>{booking.status}</span></div><p className="mt-1.5 line-clamp-1 font-display text-lg leading-none">{booking.customerName}</p><p className="mt-1 line-clamp-1 text-[8px] font-bold text-pink">{booking.treatmentName}</p><div className="mt-2 grid gap-1 text-[7px] text-black/40"><span className="flex items-center gap-1"><MapPin size={8} />{branch?.name}</span><span className="flex items-center gap-1"><UserRound size={8} />{booking.practitionerName}</span>{booking.notes && <span className="line-clamp-1">Note: {booking.notes}</span>}</div></button>;
}

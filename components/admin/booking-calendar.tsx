"use client";

import { useId, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Columns3,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import type {
  Booking,
  BookingStatus,
  CalendarService,
  StaffMember,
} from "@/lib/admin/booking-types";
import type { Branch } from "@/lib/branches";
import type { CustomerHistory } from "@/lib/admin/customer-history";

const MANUAL = "manual";
const DEFAULT_BRANCH_ID = "reading-watlington-street";
const BOOKING_DURATIONS = Array.from({ length: 8 }, (_, index) => (index + 1) * 15);
const BOOKING_TIMES = Array.from({ length: 49 }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 15;
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
});
const inputClass =
  "w-full rounded-xl border border-black/10 bg-cream px-4 py-3 text-sm outline-none focus:border-pink";
const statusStyle: Record<BookingStatus, string> = {
  confirmed: "bg-pink-light text-pink-dark",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-black/5 text-black/40",
  "no-show": "bg-red-50 text-red-700",
};
const branchStyle: Record<string, string> = {
  "reading-west-street": "border-l-pink",
  "reading-watlington-street": "border-l-[#7b3ff2]",
};
const localDate = (date: Date) => date.toLocaleDateString("en-CA");
const localDateTime = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
const startOfWeek = (date: Date) => {
  const day = new Date(date);
  const weekday = day.getDay() || 7;
  day.setDate(day.getDate() - weekday + 1);
  day.setHours(0, 0, 0, 0);
  return day;
};
const startOfMonthGrid = (date: Date) =>
  startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1));
const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};
const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

function BookingDateTimeFields({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [date = "", time = ""] = value.split("T");
  return (
    <>
      <input type="hidden" name="startsAt" value={value} />
      <label className="grid gap-2 text-xs font-bold">
        Date
        <input
          required
          type="date"
          value={date}
          onChange={(event) => onChange(`${event.target.value}T${time}`)}
          className={inputClass}
        />
      </label>
      <label className="grid gap-2 text-xs font-bold">
        Start time
        <select
          required
          value={time}
          onChange={(event) => onChange(`${date}T${event.target.value}`)}
          className={inputClass}
        >
          <option value="">Select start time</option>
          {time && !BOOKING_TIMES.includes(time) && (
            <option value={time}>{time}</option>
          )}
          {BOOKING_TIMES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

type Props = {
  initialBookings: Booking[];
  customers: CustomerHistory[];
  branches: Branch[];
  services: CalendarService[];
  staff: StaffMember[];
};
type CalendarView = "month" | "week" | "day";
type Message = {
  type: "idle" | "saving" | "success" | "warning" | "error";
  message?: string;
};
type BookingResponse = {
  booking?: Booking;
  notification?: { sent: boolean; reason?: string };
  error?: string;
};
type DeleteBookingResponse = { deleted?: { id: string }; error?: string };

type TreatmentPickerProps = {
  services: CalendarService[];
  value: string;
  onChange: (value: string) => void;
};

function TreatmentPicker({ services, value, onChange }: TreatmentPickerProps) {
  const optionsId = useId();
  const selected = services.find((service) => service.id === value);
  const [query, setQuery] = useState(selected?.title || (value === MANUAL ? "Other / enter manually" : ""));
  const [open, setOpen] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      services
        .filter((service) =>
          [service.title, service.kind, service.duration].some((field) =>
            field.toLowerCase().includes(normalizedQuery),
          ),
        )
        .slice(0, 20),
    [normalizedQuery, services],
  );

  function choose(service: CalendarService) {
    onChange(service.id);
    setQuery(service.title);
    setOpen(false);
  }

  return (
    <span className="relative block">
      <input type="hidden" name="serviceId" value={value} />
      <span className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35" size={16} />
        <input
          required
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={optionsId}
          placeholder="Search treatments, e.g. Laser"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange("");
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && open && matches[0]) {
              event.preventDefault();
              choose(matches[0]);
            }
          }}
          className={`${inputClass} pl-11 pr-10`}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear treatment search"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery("");
              onChange("");
              setOpen(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-black/35 hover:bg-black/5 hover:text-black"
          >
            <X size={15} />
          </button>
        )}
      </span>
      {open && (
        <span id={optionsId} role="listbox" className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-black/10 bg-white p-1.5 shadow-xl">
          {matches.length ? matches.map((service) => (
            <button
              key={service.id}
              type="button"
              role="option"
              aria-selected={service.id === value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(service)}
              className="block w-full rounded-lg px-3 py-2.5 text-left hover:bg-pink-light/40"
            >
              <strong className="block text-sm">{service.title}</strong>
              <small className="block font-medium text-black/45">{service.kind} · {service.duration}</small>
            </button>
          )) : (
            <span className="block px-3 py-4 text-xs font-medium text-black/45">No matching treatments.</span>
          )}
          <button
            type="button"
            role="option"
            aria-selected={value === MANUAL}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange(MANUAL);
              setQuery("Other / enter manually");
              setOpen(false);
            }}
            className="mt-1 block w-full rounded-lg border-t border-black/5 px-3 py-2.5 text-left text-sm font-bold text-pink hover:bg-pink-light/40"
          >
            Other / enter manually
          </button>
        </span>
      )}
      {selected && <small className="mt-1.5 block font-medium text-black/45">Selected: {selected.title}</small>}
    </span>
  );
}

export function BookingCalendar({
  initialBookings,
  customers,
  branches,
  services,
  staff,
}: Props) {
  const [bookings, setBookings] = useState(initialBookings);
  const [view, setView] = useState<CalendarView>("week");
  const [cursorDate, setCursorDate] = useState(new Date());
  const [branchFilter, setBranchFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const defaultBranch = branches.some((branch) => branch.id === DEFAULT_BRANCH_ID)
    ? DEFAULT_BRANCH_ID
    : branches[0]?.id || "";
  const [formBranch, setFormBranch] = useState(defaultBranch);
  const [formService, setFormService] = useState("");
  const [formStaff, setFormStaff] = useState("");
  const [formTreatmentName, setFormTreatmentName] = useState("");
  const [formDuration, setFormDuration] = useState(60);
  const [formPractitionerName, setFormPractitionerName] = useState("");
  const [formStartsAt, setFormStartsAt] = useState("");
  const [formPickerVersion, setFormPickerVersion] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [showCustomerLookup, setShowCustomerLookup] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [editBranch, setEditBranch] = useState("");
  const [editService, setEditService] = useState("");
  const [editStaff, setEditStaff] = useState("");
  const [editDuration, setEditDuration] = useState(60);
  const [editStartsAt, setEditStartsAt] = useState("");
  const [message, setMessage] = useState<Message>({ type: "idle" });
  const [editMessage, setEditMessage] = useState<Message>({ type: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const customer = customers.find((item) => item.id === selectedCustomer);
  const normalizedCustomerQuery = customerQuery.trim().toLowerCase();
  const matchingCustomers = useMemo(
    () =>
      normalizedCustomerQuery
        ? customers
            .filter((item) =>
              [item.name, item.phone, item.email].some((value) =>
                value.toLowerCase().includes(normalizedCustomerQuery),
              ),
            )
            .slice(0, 8)
        : [],
    [customers, normalizedCustomerQuery],
  );

  function selectCustomer(nextCustomer: CustomerHistory) {
    setSelectedCustomer(nextCustomer.id);
    setCustomerQuery(nextCustomer.name);
    setShowCustomerLookup(false);
  }

  function clearCustomerSelection() {
    setSelectedCustomer("");
    setCustomerQuery("");
    setShowCustomerLookup(false);
  }
  const branchServices = useMemo(
    () => services.filter((service) => service.branchIds.includes(formBranch)),
    [formBranch, services],
  );
  const editBranchServices = useMemo(
    () => services.filter((service) => service.branchIds.includes(editBranch)),
    [editBranch, services],
  );

  const weekStart = useMemo(() => startOfWeek(cursorDate), [cursorDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );
  const monthDays = useMemo(
    () =>
      Array.from({ length: 42 }, (_, index) =>
        addDays(startOfMonthGrid(cursorDate), index),
      ),
    [cursorDate],
  );
  const eligibleStaff = useMemo(
    () =>
      staff.filter(
        (member) =>
          member.branchIds.includes(formBranch) &&
          (formService === MANUAL || formService.startsWith("catalog:") || member.serviceIds.includes(formService)),
      ),
    [formBranch, formService, staff],
  );
  const editEligibleStaff = useMemo(
    () =>
      staff.filter(
        (member) =>
          member.branchIds.includes(editBranch) &&
          (editService === MANUAL || editService.startsWith("catalog:") || member.serviceIds.includes(editService)),
      ),
    [editBranch, editService, staff],
  );
  const filteredBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          (branchFilter === "all" || booking.branchId === branchFilter) &&
          (staffFilter === "all" || booking.staffId === staffFilter),
      ),
    [bookings, branchFilter, staffFilter],
  );

  const title =
    view === "month"
      ? cursorDate.toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        })
      : view === "day"
        ? cursorDate.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : `${weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${addDays(weekStart, 6).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  function openEdit(booking: Booking) {
    setEditing(booking);
    setEditBranch(booking.branchId);
    setEditService(
      services.some((service) => service.id === booking.serviceId)
        ? booking.serviceId
        : MANUAL,
    );
    setEditStaff(
      booking.staffId.startsWith("manual:") ? MANUAL : booking.staffId,
    );
    setEditDuration(booking.durationMinutes);
    setEditStartsAt(localDateTime(new Date(booking.startsAt)));
    setEditMessage({ type: "idle" });
  }

  function bookingsForDay(day: Date) {
    return filteredBookings
      .filter(
        (booking) => localDate(new Date(booking.startsAt)) === localDate(day),
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  function selectNewBookingSlot(day: Date, hour = 9, minute = 0) {
    const selected = new Date(day);
    selected.setHours(hour, minute, 0, 0);
    setCursorDate(selected);
    setFormStartsAt(localDateTime(selected));
    setMessage({
      type: "success",
      message: `New booking time selected for ${selected.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} at ${selected.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.`,
    });
    window.requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function moveCursor(amount: number) {
    setCursorDate((current) =>
      view === "month"
        ? addMonths(current, amount)
        : addDays(current, amount * (view === "week" ? 7 : 1)),
    );
  }

  async function save(
    body: Record<string, unknown>,
    setter: React.Dispatch<React.SetStateAction<Message>>,
  ) {
    setter({ type: "saving" });
    const response = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json()) as BookingResponse;
    if (!response.ok || !result.booking) {
      setter({
        type: "error",
        message: result.error || "Could not update booking.",
      });
      return undefined;
    }
    setBookings((current) =>
      current.map((booking) =>
        booking.id === result.booking!.id ? result.booking! : booking,
      ),
    );
    setter(
      result.notification && !result.notification.sent
        ? {
            type: "warning",
            message: `Booking updated, but customer notification was not sent: ${result.notification.reason || "provider unavailable"}`,
          }
        : { type: "success", message: "Booking updated." },
    );
    return result.booking;
  }

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (!form.get("serviceId")) {
      setMessage({ type: "error", message: "Search for and select a treatment." });
      return;
    }
    setMessage({ type: "saving" });
    const response = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        branchId: form.get("branchId"),
        serviceId: form.get("serviceId"),
        treatmentName: form.get("treatmentName"),
        durationMinutes: Number(form.get("durationMinutes")),
        staffId: form.get("staffId"),
        practitionerName: form.get("practitionerName"),
        customerFirstName: form.get("customerFirstName"),
        customerLastName: form.get("customerLastName"),
        customerEmail: form.get("customerEmail"),
        customerPhone: form.get("customerPhone"),
        customerAddress: form.get("customerAddress"),
        customerPostcode: form.get("customerPostcode"),
        customerGender: form.get("customerGender"),
        customerOccupation: form.get("customerOccupation"),
        customerDateOfBirth: form.get("customerDateOfBirth"),
        marketingConsent: form.get("marketingConsent") === "on",
        startsAt: new Date(String(form.get("startsAt"))).toISOString(),
        notes: form.get("notes"),
      }),
    });
    const result = (await response.json()) as BookingResponse;
    if (!response.ok || !result.booking) {
      setMessage({
        type: "error",
        message: result.error || "Could not create booking.",
      });
      return;
    }
    setBookings((current) => [...current, result.booking!]);
    setCursorDate(new Date(result.booking.startsAt));
    setMessage(
      result.notification && !result.notification.sent
        ? {
            type: "warning",
            message: `Booking created, but customer confirmation was not sent: ${result.notification.reason || "provider unavailable"}`,
          }
        : {
            type: "success",
            message: "Booking created and customer confirmation sent.",
          },
    );
    formElement.reset();
    setFormBranch(defaultBranch);
    setFormService("");
    setFormPickerVersion((version) => version + 1);
    setFormStaff("");
    setFormTreatmentName("");
    setFormDuration(60);
    setFormPractitionerName("");
    setFormStartsAt("");
    clearCustomerSelection();
  }

  async function submitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    if (!form.get("serviceId")) {
      setEditMessage({ type: "error", message: "Search for and select a treatment." });
      return;
    }
    const updated = await save(
      {
        id: editing.id,
        branchId: form.get("branchId"),
        serviceId: form.get("serviceId"),
        treatmentName: form.get("treatmentName"),
        durationMinutes: Number(form.get("durationMinutes")),
        staffId: form.get("staffId"),
        practitionerName: form.get("practitionerName"),
        customerFirstName: form.get("customerFirstName"),
        customerLastName: form.get("customerLastName"),
        customerEmail: form.get("customerEmail"),
        customerPhone: form.get("customerPhone"),
        customerAddress: form.get("customerAddress"),
        customerPostcode: form.get("customerPostcode"),
        customerGender: form.get("customerGender"),
        customerOccupation: form.get("customerOccupation"),
        customerDateOfBirth: form.get("customerDateOfBirth"),
        marketingConsent: form.get("marketingConsent") === "true",
        marketingConsentUpdatedAt:
          form.get("marketingConsent") === String(editing.marketingConsent)
            ? editing.marketingConsentUpdatedAt
            : new Date().toISOString(),
        startsAt: new Date(String(form.get("startsAt"))).toISOString(),
        status: form.get("status"),
        notes: form.get("notes"),
      },
      setEditMessage,
    );
    if (updated) window.setTimeout(() => setEditing(null), 450);
  }

  async function removeEditingBooking() {
    if (
      !editing ||
      !window.confirm(
        `Delete booking for ${editing.customerName}? This cannot be undone.`,
      )
    )
      return;
    setEditMessage({ type: "saving", message: "Deleting booking..." });
    const response = await fetch("/api/admin/bookings", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: editing.id }),
    });
    const result = (await response.json()) as DeleteBookingResponse;
    if (!response.ok || !result.deleted) {
      setEditMessage({
        type: "error",
        message: result.error || "Could not delete booking.",
      });
      return;
    }
    setBookings((current) =>
      current.filter((booking) => booking.id !== result.deleted!.id),
    );
    setEditMessage({ type: "success", message: "Booking deleted." });
    window.setTimeout(() => setEditing(null), 350);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <form
        ref={formRef}
        onSubmit={create}
        className="h-fit rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-pink text-white">
            <Plus size={18} />
          </span>
          <div>
            <h2 className="font-display text-2xl">New booking</h2>
            <p className="text-[10px] text-black/40">
              Click a calendar day or time slot to prefill this form
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-xs font-bold">
            Branch
            <select
              name="branchId"
              value={formBranch}
              onChange={(e) => {
                setFormBranch(e.target.value);
                setFormService("");
                setFormStaff("");
              }}
              className={inputClass}
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs font-bold">
            Treatment
            <TreatmentPicker
              key={`${formBranch}:${formPickerVersion}`}
              services={branchServices}
              value={formService}
              onChange={(value) => {
                setFormService(value);
                setFormStaff("");
                const duration = services.find((service) => service.id === value)?.durationMinutes;
                setFormDuration(
                  duration && BOOKING_DURATIONS.includes(duration)
                    ? duration
                    : 60,
                );
              }}
            />
          </label>
          {formService === MANUAL && (
            <label className="grid gap-2 text-xs font-bold">
              Treatment name
              <input
                required
                name="treatmentName"
                value={formTreatmentName}
                onChange={(e) => setFormTreatmentName(e.target.value)}
                className={inputClass}
              />
            </label>
          )}
          <label className="grid gap-2 text-xs font-bold">
            Appointment duration
            <select
              name="durationMinutes"
              value={formDuration}
              onChange={(event) => setFormDuration(Number(event.target.value))}
              className={inputClass}
            >
              {BOOKING_DURATIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes < 60
                    ? `${minutes} minutes`
                    : minutes === 60
                      ? "1 hour"
                      : minutes === 120
                        ? "2 hours"
                        : `1 hour ${minutes - 60} minutes`}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs font-bold">
            Practitioner
            <select
              required
              name="staffId"
              value={formStaff}
              onChange={(e) => setFormStaff(e.target.value)}
              className={inputClass}
            >
              <option value="">Select practitioner</option>
              {eligibleStaff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
              <option value={MANUAL}>Other / enter manually</option>
            </select>
          </label>
          {formStaff === MANUAL && (
            <label className="grid gap-2 text-xs font-bold">
              Practitioner name
              <input
                required
                name="practitionerName"
                value={formPractitionerName}
                onChange={(e) => setFormPractitionerName(e.target.value)}
                className={inputClass}
              />
            </label>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <BookingDateTimeFields
              value={formStartsAt}
              onChange={setFormStartsAt}
            />
          </div>
          <fieldset className="grid gap-4 rounded-2xl border border-black/5 bg-pink-light/20 p-4">
            <legend className="px-1 text-xs font-bold text-black/55">Customer details</legend>
            <div className="grid gap-2 text-xs font-bold">
              <label htmlFor="bookingCustomerLookup">Find an existing customer</label>
              <span className="relative">
                <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35" />
                <input
                  id="bookingCustomerLookup"
                  value={customerQuery}
                  onFocus={() => setShowCustomerLookup(true)}
                  onChange={(event) => {
                    setCustomerQuery(event.target.value);
                    setShowCustomerLookup(true);
                  }}
                  placeholder="Search name, phone or email"
                  autoComplete="off"
                  className={`${inputClass} pl-11 pr-10`}
                />
                {customerQuery && (
                  <button type="button" onClick={clearCustomerSelection} aria-label="Clear customer search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-black/35 hover:bg-white hover:text-pink">
                    <X size={13} />
                  </button>
                )}
                {showCustomerLookup && normalizedCustomerQuery && (
                  <span className="absolute z-30 mt-2 block max-h-72 w-full overflow-y-auto rounded-xl border border-black/10 bg-white p-2 shadow-luxe">
                    {matchingCustomers.length ? matchingCustomers.map((item) => (
                      <button key={item.id} type="button" onClick={() => selectCustomer(item)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-pink-light/40">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink-light text-pink"><UserRound size={14} /></span>
                        <span className="min-w-0">
                          <strong className="block truncate text-sm">{item.name}</strong>
                          <small className="block truncate font-medium text-black/45">{[item.phone, item.email].filter(Boolean).join(" · ")}</small>
                        </span>
                      </button>
                    )) : (
                      <span className="block px-3 py-4 text-xs font-medium text-black/45">No matching customer. Enter details below to create one.</span>
                    )}
                  </span>
                )}
              </span>
              {customer && (
                <span className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-[11px]">
                  <span><strong className="block">Selected: {customer.name}</strong>{customer.phone}</span>
                  <button type="button" onClick={clearCustomerSelection} className="ml-3 shrink-0 font-bold text-pink">New customer</button>
                </span>
              )}
            </div>
            <label className="grid gap-2 text-xs font-bold">
              First name
              <input key={`first-name-${selectedCustomer}`} name="customerFirstName" required autoComplete="given-name" defaultValue={customer?.firstName || ""} className={inputClass} />
            </label>
            <label className="grid gap-2 text-xs font-bold">Last name<input key={`last-name-${selectedCustomer}`} name="customerLastName" required autoComplete="family-name" defaultValue={customer?.lastName || ""} className={inputClass} /></label>
            <label className="grid gap-2 text-xs font-bold">
              Customer phone
              <input key={`phone-${selectedCustomer}`} name="customerPhone" required type="tel" defaultValue={customer?.phone || ""} className={inputClass} />
            </label>
            <label className="grid gap-2 text-xs font-bold">
              Customer email
              <input key={`email-${selectedCustomer}`} name="customerEmail" type="email" defaultValue={customer?.email || ""} className={inputClass} />
            </label>
            <label className="grid gap-2 text-xs font-bold">
              Gender
              <select
                key={`gender-${selectedCustomer}`}
                name="customerGender"
                defaultValue={customer?.gender || ""}
                className={inputClass}
              >
                <option value="">Select gender</option>
                <option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs font-bold">
              Customer address
              <textarea
                key={`address-${selectedCustomer}`}
                name="customerAddress"
                required
                autoComplete="street-address"
                rows={2}
                defaultValue={customer?.address || ""}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-xs font-bold">
              Customer postcode
              <input key={`postcode-${selectedCustomer}`} name="customerPostcode" required autoComplete="postal-code" defaultValue={customer?.postcode || ""} className={`${inputClass} uppercase`} />
            </label>
            <label className="grid gap-2 text-xs font-bold">
              Occupation
              <input key={`occupation-${selectedCustomer}`} name="customerOccupation" defaultValue={customer?.occupation || ""} className={inputClass} />
            </label>
            <label className="grid gap-2 text-xs font-bold">
              Date of birth
              <input key={`dob-${selectedCustomer}`} name="customerDateOfBirth" type="date" max={new Date().toISOString().slice(0, 10)} defaultValue={customer?.dateOfBirth || ""} className={inputClass} />
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-black/5 bg-white p-4 text-xs leading-5">
              <input
                key={`consent-${selectedCustomer}`}
                name="marketingConsent"
                type="checkbox"
                defaultChecked={customer?.marketingConsent || false}
                className="mt-1 accent-pink"
              />
              <span>
                <strong className="block">
                  Customer agrees to promotional messages
                </strong>
                Optional GDPR consent for future offers by SMS or email. Leave
                unticked if they say no.
              </span>
            </label>
          </fieldset>
          <label className="grid gap-2 text-xs font-bold">
            Appointment notes
            <textarea
              name="notes"
              rows={3}
              placeholder="What was done, products used, aftercare, follow-up needs"
              className={inputClass}
            />
          </label>
          {message.type !== "idle" && <MessageBox message={message} />}
          <button
            disabled={message.type === "saving"}
            className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
          >
            {message.type === "saving" && (
              <LoaderCircle className="animate-spin" size={15} />
            )}{" "}
            {message.type === "saving"
              ? "Creating booking..."
              : "Create booking"}
          </button>
        </div>
      </form>

      <section className="min-w-0 rounded-2xl border border-black/5 bg-white p-4 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-pink">
              Appointment calendar
            </p>
            <h2 className="mt-2 font-display text-3xl">
              {view === "month"
                ? "Monthly schedule"
                : view === "day"
                  ? "Daily schedule"
                  : "Weekly schedule"}
            </h2>
            <p className="mt-2 inline-flex items-center gap-2 rounded-xl bg-pink-light/50 px-3 py-2 text-sm font-bold text-ink">
              <CalendarDays size={16} className="text-pink" />
              {title}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => moveCursor(-1)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-black/10"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setCursorDate(new Date())}
              className="rounded-xl border border-black/10 px-4 text-xs font-bold"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => moveCursor(1)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-black/10"
            >
              <ArrowRight size={16} />
            </button>
            <div className="inline-flex rounded-xl border border-black/10 bg-white p-1">
              <ViewButton
                active={view === "month"}
                icon={<CalendarDays size={14} />}
                label="Month"
                onClick={() => setView("month")}
              />
              <ViewButton
                active={view === "week"}
                icon={<Columns3 size={14} />}
                label="Week"
                onClick={() => setView("week")}
              />
              <ViewButton
                active={view === "day"}
                icon={<Clock size={14} />}
                label="Day"
                onClick={() => setView("day")}
              />
            </div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">Both branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">All staff</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {view === "month" && (
          <MonthView
            days={monthDays}
            cursorDate={cursorDate}
            bookingsForDay={bookingsForDay}
            branches={branches}
            onSelectDay={selectNewBookingSlot}
            onEdit={openEdit}
          />
        )}
        {view === "week" && (
          <WeekView
            days={weekDays}
            bookingsForDay={bookingsForDay}
            branches={branches}
            onSelectDay={selectNewBookingSlot}
            onEdit={openEdit}
          />
        )}
        {view === "day" && (
          <DayView
            day={cursorDate}
            bookings={bookingsForDay(cursorDate)}
            branches={branches}
            onSelectSlot={selectNewBookingSlot}
            onEdit={openEdit}
          />
        )}

        <div className="mt-3 flex flex-wrap gap-4 text-[9px] font-bold uppercase tracking-[.12em] text-black/40">
          <span className="flex items-center gap-2">
            <i className="h-2 w-2 rounded-full bg-pink" />
            West Street
          </span>
          <span className="flex items-center gap-2">
            <i className="h-2 w-2 rounded-full bg-[#7b3ff2]" />
            Watlington Street
          </span>
          <span>Click a day, time slot, or booking</span>
        </div>
      </section>

      {editing && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-[#16010d]/75 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <form
            onSubmit={submitEdit}
            className="mx-auto my-8 max-w-xl rounded-2xl bg-white p-5 shadow-luxe sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-pink">
                  Edit appointment
                </p>
                <h2 className="mt-1 font-display text-3xl">
                  {editing.customerName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-2"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-bold">
                Branch
                <select
                  name="branchId"
                  value={editBranch}
                  onChange={(e) => {
                    setEditBranch(e.target.value);
                    const firstService = services.find((service) => service.branchIds.includes(e.target.value));
                    setEditService(firstService?.id || MANUAL);
                    setEditStaff("");
                  }}
                  className={inputClass}
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-xs font-bold">
                Treatment
                <TreatmentPicker
                  key={`${editing.id}:${editBranch}`}
                  services={editBranchServices}
                  value={editService}
                  onChange={(value) => {
                    setEditService(value);
                    const duration = services.find((service) => service.id === value)?.durationMinutes;
                    if (duration && BOOKING_DURATIONS.includes(duration))
                      setEditDuration(duration);
                  }}
                />
              </label>
              {editService === MANUAL && (
                <label className="grid gap-2 text-xs font-bold">
                  Treatment name
                  <input
                    required
                    name="treatmentName"
                    defaultValue={editing.treatmentName}
                    className={inputClass}
                  />
                </label>
              )}
              <label className="grid gap-2 text-xs font-bold">
                Appointment duration
                <select
                  name="durationMinutes"
                  value={editDuration}
                  onChange={(event) => setEditDuration(Number(event.target.value))}
                  className={inputClass}
                >
                  {BOOKING_DURATIONS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes < 60
                        ? `${minutes} minutes`
                        : minutes === 60
                          ? "1 hour"
                          : minutes === 120
                            ? "2 hours"
                            : `1 hour ${minutes - 60} minutes`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-xs font-bold">
                Practitioner
                <select
                  name="staffId"
                  value={editStaff}
                  onChange={(e) => setEditStaff(e.target.value)}
                  className={inputClass}
                >
                  {editEligibleStaff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                  <option value={MANUAL}>Other / enter manually</option>
                </select>
              </label>
              {editStaff === MANUAL && (
                <label className="grid gap-2 text-xs font-bold">
                  Practitioner name
                  <input
                    required
                    name="practitionerName"
                    defaultValue={editing.practitionerName}
                    className={inputClass}
                  />
                </label>
              )}
              <label className="grid gap-2 text-xs font-bold">
                Status
                <select
                  name="status"
                  defaultValue={editing.status}
                  className={inputClass}
                >
                  {(
                    [
                      "confirmed",
                      "completed",
                      "cancelled",
                      "no-show",
                    ] as BookingStatus[]
                  ).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
                <BookingDateTimeFields
                  value={editStartsAt}
                  onChange={setEditStartsAt}
                />
              </div>
              <label className="grid gap-2 text-xs font-bold">
                First name
                <input
                  name="customerFirstName"
                  required
                  autoComplete="given-name"
                  defaultValue={editing.customerFirstName}
                  className={inputClass}
                />
              </label>
              <label className="grid gap-2 text-xs font-bold">Last name<input name="customerLastName" required autoComplete="family-name" defaultValue={editing.customerLastName} className={inputClass} /></label>
              <label className="grid gap-2 text-xs font-bold">
                Customer phone
                <input
                  name="customerPhone"
                  required
                  defaultValue={editing.customerPhone}
                  className={inputClass}
                />
              </label>
              <label className="grid gap-2 text-xs font-bold sm:col-span-2">
                Customer email
                <input
                  name="customerEmail"
                  type="email"
                  defaultValue={editing.customerEmail}
                  className={inputClass}
                />
              </label>
              <label className="grid gap-2 text-xs font-bold">
                Gender
                <select name="customerGender" defaultValue={editing.customerGender} className={inputClass}>
                  <option value="">Select gender</option>
                  <option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option>
                </select>
              </label>
              <label className="grid gap-2 text-xs font-bold sm:col-span-2">
                Customer address
                <textarea
                  name="customerAddress"
                  required
                  autoComplete="street-address"
                  rows={2}
                  defaultValue={editing.customerAddress}
                  className={inputClass}
                />
              </label>
              <label className="grid gap-2 text-xs font-bold">
                Customer postcode
                <input name="customerPostcode" required autoComplete="postal-code" defaultValue={editing.customerPostcode} className={`${inputClass} uppercase`} />
              </label>
              <label className="grid gap-2 text-xs font-bold">
                Occupation
                <input name="customerOccupation" defaultValue={editing.customerOccupation} className={inputClass} />
              </label>
              <label className="grid gap-2 text-xs font-bold">
                Date of birth
                <input name="customerDateOfBirth" type="date" max={new Date().toISOString().slice(0, 10)} defaultValue={editing.customerDateOfBirth} className={inputClass} />
              </label>
              <label className="grid gap-2 text-xs font-bold sm:col-span-2">
                Promotional consent
                <select
                  name="marketingConsent"
                  defaultValue={String(editing.marketingConsent)}
                  className={inputClass}
                >
                  <option value="false">No promotional SMS or email</option>
                  <option value="true">Yes, customer opted in</option>
                </select>
                <span className="text-[10px] font-medium text-black/40">
                  Only opted-in customers should be included in future
                  promotional sends.
                </span>
              </label>
              <label className="grid gap-2 text-xs font-bold sm:col-span-2">
                Appointment notes
                <textarea
                  name="notes"
                  rows={5}
                  defaultValue={editing.notes}
                  placeholder="What was done, products used, aftercare, follow-up needs"
                  className={inputClass}
                />
              </label>
            </div>
            {editMessage.type !== "idle" && (
              <div className="mt-4">
                <MessageBox message={editMessage} />
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
                disabled={editMessage.type === "saving"}
                type="submit"
              >
                {editMessage.type === "saving" ? (
                  <LoaderCircle className="animate-spin" size={14} />
                ) : (
                  <Pencil size={14} />
                )}{" "}
                {editMessage.type === "saving"
                  ? "Saving changes..."
                  : "Save changes"}
              </button>
              {editing.status === "confirmed" && (
                <>
                  <button
                    type="button"
                    disabled={editMessage.type === "saving"}
                    onClick={() =>
                      save(
                        { id: editing.id, status: "completed" },
                        setEditMessage,
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-green-200 px-5 py-3 text-xs font-bold text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} /> Complete
                  </button>
                  <button
                    type="button"
                    disabled={editMessage.type === "saving"}
                    onClick={() =>
                      save(
                        { id: editing.id, status: "cancelled" },
                        setEditMessage,
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-3 text-xs font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <XCircle size={14} /> Cancel
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={editMessage.type === "saving"}
                onClick={removeEditingBooking}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-xs font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function MonthView({
  days,
  cursorDate,
  bookingsForDay,
  branches,
  onSelectDay,
  onEdit,
}: {
  days: Date[];
  cursorDate: Date;
  bookingsForDay: (day: Date) => Booking[];
  branches: Branch[];
  onSelectDay: (day: Date) => void;
  onEdit: (booking: Booking) => void;
}) {
  return (
    <div className="mt-6 overflow-x-auto pb-2">
      <div className="grid min-w-[980px] grid-cols-7 gap-2">
        {days.map((day) => {
          const dayItems = bookingsForDay(day);
          const muted = day.getMonth() !== cursorDate.getMonth();
          return (
            <div
              key={day.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDay(day)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ")
                  onSelectDay(day);
              }}
              className={`min-h-[150px] rounded-xl border border-black/5 bg-cream/60 p-2 text-left transition hover:border-pink/30 hover:bg-pink-light/40 ${muted ? "opacity-45" : ""}`}
            >
              <DayHeader day={day} />
              <div className="mt-2 grid gap-1.5">
                {dayItems.slice(0, 3).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    branches={branches}
                    compact
                    onEdit={(event) => {
                      event.stopPropagation();
                      onEdit(booking);
                    }}
                  />
                ))}
                {dayItems.length > 3 && (
                  <span className="px-2 text-[8px] font-bold text-black/35">
                    +{dayItems.length - 3} more
                  </span>
                )}
                {!dayItems.length && (
                  <span className="inline-flex items-center gap-1 px-2 py-3 text-[9px] text-black/25">
                    <Plus size={10} /> Add booking
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  days,
  bookingsForDay,
  branches,
  onSelectDay,
  onEdit,
}: {
  days: Date[];
  bookingsForDay: (day: Date) => Booking[];
  branches: Branch[];
  onSelectDay: (day: Date) => void;
  onEdit: (booking: Booking) => void;
}) {
  return (
    <div className="mt-6 overflow-x-auto pb-2">
      <div className="grid min-w-[980px] grid-cols-7 gap-2">
        {days.map((day) => {
          const dayItems = bookingsForDay(day);
          return (
            <div
              key={day.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDay(day)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ")
                  onSelectDay(day);
              }}
              className="min-h-[440px] rounded-xl bg-cream/60 p-2 text-left transition hover:bg-pink-light/40"
            >
              <DayHeader day={day} />
              <div className="mt-2 grid gap-2">
                {dayItems.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    branches={branches}
                    onEdit={(event) => {
                      event.stopPropagation();
                      onEdit(booking);
                    }}
                  />
                ))}
                {!dayItems.length && (
                  <span className="inline-flex items-center justify-center gap-1 px-2 py-4 text-center text-[9px] text-black/25">
                    <Plus size={10} /> Add booking
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayView({
  day,
  bookings,
  branches,
  onSelectSlot,
  onEdit,
}: {
  day: Date;
  bookings: Booking[];
  branches: Branch[];
  onSelectSlot: (day: Date, hour: number) => void;
  onEdit: (booking: Booking) => void;
}) {
  const hours = Array.from({ length: 13 }, (_, index) => index + 8);
  return (
    <div className="mt-6 grid gap-2">
      {hours.map((hour) => {
        const slotBookings = bookings.filter(
          (booking) => new Date(booking.startsAt).getHours() === hour,
        );
        return (
          <div
            key={hour}
            role="button"
            tabIndex={0}
            onClick={() => onSelectSlot(day, hour)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ")
                onSelectSlot(day, hour);
            }}
            className="grid min-h-20 grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-xl border border-black/5 bg-cream/60 p-3 text-left transition hover:border-pink/30 hover:bg-pink-light/40"
          >
            <span className="text-xs font-bold text-black/45">
              {String(hour).padStart(2, "0")}:00
            </span>
            <span className="grid gap-2">
              {slotBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  branches={branches}
                  onEdit={(event) => {
                    event.stopPropagation();
                    onEdit(booking);
                  }}
                />
              ))}
              {!slotBookings.length && (
                <span className="inline-flex items-center gap-1 text-[9px] text-black/25">
                  <Plus size={10} /> Add booking here
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ViewButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold ${active ? "bg-pink text-white" : "text-black/55 hover:bg-cream"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function DayHeader({ day }: { day: Date }) {
  return (
    <div
      className={`rounded-lg px-2 py-2 ${localDate(day) === localDate(new Date()) ? "bg-pink text-white" : "bg-white"}`}
    >
      <p className="text-[8px] font-bold uppercase tracking-[.14em]">
        {day.toLocaleDateString("en-GB", { weekday: "short" })}
      </p>
      <p className="font-display text-2xl">{day.getDate()}</p>
    </div>
  );
}

function MessageBox({ message }: { message: Message }) {
  return (
    <p
      className={`rounded-xl p-3 text-xs font-bold ${message.type === "error" ? "bg-red-50 text-red-700" : message.type === "warning" ? "bg-amber-50 text-amber-900" : message.type === "success" ? "bg-green-50 text-green-700" : "bg-pink-light text-pink-dark"}`}
    >
      {message.message || "Saving..."}
    </p>
  );
}

function BookingCard({
  booking,
  branches,
  compact,
  onEdit,
}: {
  booking: Booking;
  branches: Branch[];
  compact?: boolean;
  onEdit: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const branch = branches.find((item) => item.id === booking.branchId);
  return (
    <button
      type="button"
      onClick={onEdit}
      className={`w-full rounded-lg border border-black/5 border-l-4 bg-white p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${branchStyle[booking.branchId] || "border-l-black"} ${booking.status === "cancelled" ? "opacity-45" : ""}`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[9px] font-bold">
          {new Date(booking.startsAt).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span
          className={`rounded-full px-1.5 py-0.5 text-[6px] font-bold uppercase ${statusStyle[booking.status]}`}
        >
          {booking.status}
        </span>
      </div>
      <p
        className={`mt-1.5 line-clamp-1 font-display leading-none ${compact ? "text-sm" : "text-lg"}`}
      >
        {booking.customerName}
      </p>
      <p className="mt-1 line-clamp-1 text-[8px] font-bold text-pink">
        {booking.treatmentName}
      </p>
      {!compact && (
        <div className="mt-2 grid gap-1 text-[7px] text-black/40">
          <span className="flex items-center gap-1">
            <MapPin size={8} />
            {branch?.name}
          </span>
          <span className="flex items-center gap-1">
            <UserRound size={8} />
            {booking.practitionerName}
          </span>
          {booking.notes && (
            <span className="line-clamp-1">Note: {booking.notes}</span>
          )}
        </div>
      )}
    </button>
  );
}

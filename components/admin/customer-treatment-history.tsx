"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import type { Booking } from "@/lib/admin/booking-types";
import type { Branch } from "@/lib/branches";
import { EditTreatmentRecord } from "@/components/admin/edit-treatment-record";
import { treatmentImageUrl } from "@/components/admin/treatment-images";
function progress(notes: string) {
  const match = notes.match(/^Session:\s*(\d+)\s*of\s*(\d+)/i);
  return match
    ? { current: Number(match[1]), total: Number(match[2]) }
    : undefined;
}
function summary(bookings: Booking[]) {
  const groups = new Map<
    string,
    {
      key: string;
      name: string;
      visits: number;
      current: number;
      total: number;
    }
  >();
  for (const booking of bookings) {
    const key = booking.treatmentName.trim().toLowerCase();
    const previous = groups.get(key) || {
      key,
      name: booking.treatmentName,
      visits: 0,
      current: 0,
      total: 0,
    };
    const session = progress(booking.notes);
    groups.set(key, {
      ...previous,
      visits: previous.visits + 1,
      current: Math.max(previous.current, session?.current || 0),
      total: Math.max(previous.total, session?.total || 0),
    });
  }
  return [...groups.values()];
}
export function CustomerTreatmentHistory({
  bookings,
  branches,
}: {
  bookings: Booking[];
  branches: Branch[];
}) {
  const [selected, setSelected] = useState("all");
  const treatments = useMemo(() => summary(bookings), [bookings]);
  const visible =
    selected === "all"
      ? bookings
      : bookings.filter(
          (booking) => booking.treatmentName.trim().toLowerCase() === selected,
        );
  return (
    <>
      <div className="mt-5 rounded-xl bg-cream p-4">
        <p className="text-[9px] font-bold uppercase tracking-[.16em] text-pink">
          Treatment overview
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Filter
            active={selected === "all"}
            onClick={() => setSelected("all")}
          >
            All treatments: {bookings.length}
          </Filter>
          {treatments.map((item) => (
            <Filter
              key={item.key}
              active={selected === item.key}
              onClick={() => setSelected(item.key)}
            >
              {item.name}:{" "}
              {item.total
                ? `${item.current} of ${item.total} sessions`
                : `${item.visits} ${item.visits === 1 ? "visit" : "visits"}`}
            </Filter>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[.16em] text-black/40">
          {selected === "all"
            ? "All treatments"
            : treatments.find((item) => item.key === selected)?.name}{" "}
          timeline · newest first
        </p>
        <div className="overflow-hidden rounded-xl border border-black/5">
          {visible.map((booking) => {
            const branch = branches.find(
              (item) => item.id === booking.branchId,
            );
            return (
              <div
                key={booking.id}
                className="grid gap-3 border-b border-black/5 p-4 last:border-0 md:grid-cols-[180px_minmax(0,1fr)]"
              >
                <div className="text-xs">
                  <p className="font-bold">
                    {new Date(booking.startsAt).toLocaleString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-1 text-black/40">
                    {branch?.name || "Unknown branch"} · {booking.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold">{booking.treatmentName}</p>
                  <p className="mt-1 text-xs text-black/45">
                    Practitioner: {booking.practitionerName}
                  </p>
                  {booking.notes ? (
                    <p className="mt-3 whitespace-pre-line rounded-lg bg-cream p-3 text-xs leading-5 text-black/60">
                      {booking.notes}
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-black/30">
                      No appointment notes recorded.
                    </p>
                  )}
                  {booking.images?.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {booking.images.map((item) => <div key={item.id} className="relative overflow-hidden rounded-lg border border-black/10"><Image src={treatmentImageUrl(item)} alt={`${item.phase} treatment image`} width={240} height={240} unoptimized className="aspect-square w-full object-cover" /><span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">{item.phase}</span></div>)}
                  </div>}
                  <EditTreatmentRecord booking={booking} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
function Filter({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-xs font-bold shadow-sm transition ${active ? "bg-pink text-white" : "bg-white hover:text-pink"}`}
    >
      {children}
    </button>
  );
}

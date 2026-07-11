"use client";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CustomerHistory } from "@/lib/admin/customer-history";
export function CustomerSearch({
  customers,
  initialQuery = "",
}: {
  customers: CustomerHistory[];
  initialQuery?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const query = value.trim().toLowerCase();
  const matches = useMemo(
    () =>
      query
        ? customers
            .filter(
              (c) =>
                c.name.toLowerCase().includes(query) ||
                c.phone.replace(/\s/g, "").includes(query.replace(/\s/g, "")),
            )
            .slice(0, 8)
        : [],
    [customers, query],
  );
  function choose(customer: CustomerHistory) {
    setValue(customer.name);
    router.push(`/admin/customers?q=${encodeURIComponent(customer.phone)}`);
  }
  return (
    <div className="relative mt-6 max-w-xl">
      <Search className="absolute left-4 top-3.5 text-black/35" size={16} />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Start typing a customer name or phone number"
        className="w-full rounded-xl border border-black/10 bg-white py-3 pl-11 pr-11 text-sm outline-none focus:border-pink"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            router.push("/admin/customers");
          }}
          className="absolute right-3 top-2.5 p-1 text-black/35"
        >
          <X size={16} />
        </button>
      )}
      {query && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-luxe">
          {matches.length ? (
            matches.map((customer) => (
              <button
                type="button"
                key={customer.id}
                onClick={() => choose(customer)}
                className="flex w-full items-center justify-between border-b border-black/5 px-4 py-3 text-left last:border-0 hover:bg-pink-light/40"
              >
                <span>
                  <strong className="block text-sm">{customer.name}</strong>
                  <small className="text-black/45">{customer.phone}</small>
                </span>
                <small className="text-black/35">
                  {customer.bookings.length} records
                </small>
              </button>
            ))
          ) : (
            <p className="p-4 text-xs text-black/45">No customers found.</p>
          )}
        </div>
      )}
    </div>
  );
}

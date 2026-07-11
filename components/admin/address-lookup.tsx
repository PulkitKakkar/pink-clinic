"use client";
import { useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
export function AddressLookup({
  name = "address",
  defaultValue = "",
}: {
  name?: string;
  defaultValue?: string;
}) {
  const [postcode, setPostcode] = useState("");
  const [addresses, setAddresses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function lookup() {
    setLoading(true);
    setError("");
    const response = await fetch(
      `/api/admin/address-lookup?postcode=${encodeURIComponent(postcode)}`,
    );
    const data = (await response.json()) as {
      addresses?: string[];
      error?: string;
    };
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Address lookup failed.");
      return;
    }
    setAddresses(data.addresses || []);
  }
  const cls =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-pink";
  return (
    <span className="grid gap-2">
      <span className="flex gap-2">
        <input
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="UK postcode"
          className={cls}
        />
        <button
          type="button"
          onClick={lookup}
          disabled={loading || !postcode.trim()}
          className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 text-xs font-bold"
        >
          {loading ? (
            <LoaderCircle className="animate-spin" size={14} />
          ) : (
            <Search size={14} />
          )}{" "}
          Find
        </button>
      </span>
      {addresses.length > 0 && (
        <select
          onChange={(e) => {
            const textarea =
              e.currentTarget.parentElement?.querySelector("textarea");
            if (textarea) textarea.value = e.target.value;
          }}
          className={cls}
        >
          <option value="">Choose an address</option>
          {addresses.map((address) => (
            <option key={address}>{address}</option>
          ))}
        </select>
      )}
      {error && <small className="text-red-600">{error}</small>}
      <textarea
        name={name}
        rows={3}
        defaultValue={defaultValue}
        placeholder="Full address"
        className={cls}
      />
    </span>
  );
}

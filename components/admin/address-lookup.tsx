export function AddressLookup({
  name = "address",
  defaultValue = "",
  required = false,
}: {
  name?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const cls =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-pink";
  return (
    <textarea
      name={name}
      rows={3}
      defaultValue={defaultValue}
      required={required}
      autoComplete="street-address"
      placeholder="House/building, street, town or city"
      className={cls}
    />
  );
}

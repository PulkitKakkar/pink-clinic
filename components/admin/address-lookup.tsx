export function AddressLookup({
  name = "address",
  defaultValue = "",
}: {
  name?: string;
  defaultValue?: string;
}) {
  const cls =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-pink";
  return (
    <textarea
      name={name}
      rows={3}
      defaultValue={defaultValue}
      placeholder="House/building, street, town or city"
      className={cls}
    />
  );
}

"use client";

import { useId } from "react";

export function SearchableOptionInput({
  name,
  options,
  required,
  defaultValue,
  placeholder,
  className,
}: {
  name: string;
  options: string[];
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <>
      <input
        name={name}
        list={id}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
      <datalist id={id}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
}

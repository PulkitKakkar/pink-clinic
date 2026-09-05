"use client";

import { useId } from "react";

export function SearchableOptionInput({
  name,
  options,
  required,
  defaultValue,
  placeholder,
  className,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const id = useId();
  return (
    <>
      <input
        name={name}
        list={id}
        required={required}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
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

"use client";

import { Icon } from "@iconify/react";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchFieldProps) {
  return (
    <div className={`relative flex-1 max-w-sm ${className}`.trim()}>
      <Icon
        icon="solar:magnifer-bold-duotone"
        className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-base h-9 border-none bg-card pl-8 shadow-sm"
      />
    </div>
  );
}

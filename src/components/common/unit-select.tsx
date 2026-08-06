"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UNITS_OF_MEASURE,
  getUnitsByCategory,
  type UnitCategory,
} from "@/lib/utils/units";

interface UnitSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Disable the control. */
  disabled?: boolean;
}

const CATEGORIES: Array<{ value: UnitCategory; label: string }> = [
  { value: "weight", label: "Weight" },
  { value: "volume", label: "Volume" },
  { value: "length", label: "Length" },
  { value: "area", label: "Area" },
  { value: "count", label: "Count / Packaging" },
  { value: "other", label: "Other" },
];

/**
 * Reusable grouped unit-of-measure dropdown.
 *
 * Lists every trade unit in 6 categories. If the current value isn't part of
 * the standard list (e.g. legacy data with "KG" instead of "kg"), it's shown
 * in a trailing "Custom" group so the user keeps their existing selection.
 */
export function UnitSelect({
  value,
  onChange,
  placeholder = "Select unit",
  className,
  disabled,
}: UnitSelectProps) {
  const isCustom =
    !!value && !UNITS_OF_MEASURE.some((u) => u.value === value);

  return (
    <Select
      value={value || undefined}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map((cat) => {
          const units = getUnitsByCategory(cat.value);
          if (units.length === 0) return null;
          return (
            <SelectGroup key={cat.value}>
              <SelectLabel>{cat.label}</SelectLabel>
              {units.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectGroup>
          );
        })}
        {isCustom && (
          <SelectGroup>
            <SelectLabel>Custom</SelectLabel>
            <SelectItem value={value}>{value}</SelectItem>
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}

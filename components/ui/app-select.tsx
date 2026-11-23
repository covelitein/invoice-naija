"use client";

import { Label, ListBox, Select } from "@heroui/react";

export type AppSelectOption = {
  id: string;
  label: string;
};

export function AppSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  "aria-label": ariaLabel,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: AppSelectOption[];
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <Select
      fullWidth
      variant="secondary"
      placeholder={placeholder}
      value={value}
      aria-label={ariaLabel || label}
      onChange={(key) => {
        if (key == null) return;
        onChange(String(key));
      }}
      className={`app-select ${className}`.trim()}
    >
      {label ? <Label className="text-sm font-medium text-foreground">{label}</Label> : null}
      <Select.Trigger className="app-select-trigger">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className="app-select-popover">
        <ListBox>
          {options.map((option) => (
            <ListBox.Item
              key={option.id}
              id={option.id}
              textValue={option.label}
              className="app-select-item"
            >
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

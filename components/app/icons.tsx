import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

export function DocumentsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 4h6l4 4v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M14 4v4h4" />
      <path d="M10 13h5M10 17h5" />
    </svg>
  );
}

export function CustomersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 19a4.5 4.5 0 0 1 5 0" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 15.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 8.1l1.6-1.6" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16.5 16.5 3.5 3.5" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function HelpIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.2a2.6 2.6 0 1 1 3.7 2.4c-.8.4-1.2.9-1.2 1.9" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7.5 18.5 6 21l2.8-.8A8.5 8.5 0 1 0 7.5 18.5Z" />
      <path d="M9.2 10.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .4-.1.6l-.3.4c-.1.2-.1.4.1.6.4.5 1 .9 1.6 1.2.2.1.4.1.6-.1l.5-.4c.2-.1.4-.1.6 0l1.3.7c.2.1.3.3.3.5v.5c0 .3-.1.5-.4.6A5.4 5.4 0 0 1 12 16.8a5.8 5.8 0 0 1-2.8-2.8 5.2 5.2 0 0 1-.1-2.3c.1-.3.3-.5.5-.6Z" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4.5l3 1.5" />
    </svg>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 13.4 8.6 18.5 10 13.4 11.4 12 16.5 10.6 11.4 5.5 10 10.6 8.6 12 3.5Z" />
      <path d="M18 14.5 18.7 16.8 21 17.5 18.7 18.2 18 20.5 17.3 18.2 15 17.5 17.3 16.8 18 14.5Z" />
      <path d="M6.5 14 7 15.6 8.5 16.1 7 16.6 6.5 18.2 6 16.6 4.5 16.1 6 15.6 6.5 14Z" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 8h14M10 8V6h4v2M8 8l.8 11h6.4L16 8" />
    </svg>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16l-5.5 7v5l-5 2v-7L4 6Z" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14.5 6 8.5 12l6 6" />
    </svg>
  );
}

export function PdfIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 4h6l4 4v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M14 4v4h4" />
      <path d="M9.2 14.2h1.4c.9 0 1.5.5 1.5 1.3s-.6 1.3-1.5 1.3H9.8V18H9.2v-3.8Zm1.4 2c.4 0 .8-.2.8-.7s-.4-.7-.8-.7h-.8v1.4h.8ZM13.4 14.2h1.7c1.1 0 1.9.7 1.9 1.9s-.8 1.9-1.9 1.9h-1.1V18h-.6v-3.8Zm1.7 3.1c.8 0 1.3-.4 1.3-1.2s-.5-1.2-1.3-1.2h-1.1v2.4h1.1Z" />
    </svg>
  );
}

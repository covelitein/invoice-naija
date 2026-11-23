type SceneProps = {
  className?: string;
};

export function EmptyWorkspaceScene({ className = "" }: SceneProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={className}
      role="img"
      aria-label="Empty workspace illustration"
    >
      <defs>
        <linearGradient id="ew-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e7f3ea" />
          <stop offset="100%" stopColor="#f7faf7" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" rx="28" fill="url(#ew-sky)" />
      <ellipse
        className="illust-float"
        cx="250"
        cy="48"
        rx="28"
        ry="12"
        fill="#cfe6d5"
        opacity="0.7"
      />
      <ellipse
        className="illust-float-delayed"
        cx="70"
        cy="160"
        rx="36"
        ry="14"
        fill="#d7eadc"
        opacity="0.8"
      />
      <g className="illust-bob">
        <rect x="96" y="54" width="128" height="100" rx="16" fill="#fff" />
        <rect x="112" y="72" width="72" height="8" rx="4" fill="#d9e6dc" />
        <rect x="112" y="90" width="96" height="8" rx="4" fill="#e8f0ea" />
        <rect x="112" y="108" width="84" height="8" rx="4" fill="#e8f0ea" />
        <circle cx="200" cy="128" r="18" fill="#1f8f4e" />
        <path
          d="M193 128h14M200 121v14"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
      <g className="illust-drift">
        <rect x="214" y="78" width="54" height="70" rx="12" fill="#f0f7f2" />
        <rect x="224" y="92" width="34" height="6" rx="3" fill="#cfe6d5" />
        <rect x="224" y="106" width="28" height="6" rx="3" fill="#dceadf" />
      </g>
    </svg>
  );
}

export function DocumentsScene({ className = "" }: SceneProps) {
  return (
    <svg
      viewBox="0 0 320 180"
      className={className}
      role="img"
      aria-label="Documents illustration"
    >
      <rect width="320" height="180" rx="28" fill="#eef5ef" />
      <g className="illust-bob">
        <rect
          x="78"
          y="36"
          width="110"
          height="120"
          rx="14"
          fill="#fff"
          transform="rotate(-6 133 96)"
        />
        <rect
          x="118"
          y="42"
          width="110"
          height="120"
          rx="14"
          fill="#fff"
          stroke="#d7e5db"
        />
        <rect x="136" y="62" width="74" height="8" rx="4" fill="#1f8f4e" opacity="0.85" />
        <rect x="136" y="80" width="64" height="7" rx="3.5" fill="#dce8df" />
        <rect x="136" y="96" width="70" height="7" rx="3.5" fill="#dce8df" />
        <rect x="136" y="112" width="48" height="7" rx="3.5" fill="#dce8df" />
      </g>
      <g className="illust-float">
        <circle cx="248" cy="56" r="22" fill="#1f8f4e" />
        <path
          d="M240 56h16M248 48v16"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function CustomersScene({ className = "" }: SceneProps) {
  return (
    <svg
      viewBox="0 0 320 180"
      className={className}
      role="img"
      aria-label="Customers illustration"
    >
      <rect width="320" height="180" rx="28" fill="#f3f8f4" />
      <g className="illust-bob">
        <circle cx="128" cy="78" r="28" fill="#cfe6d5" />
        <circle cx="128" cy="72" r="14" fill="#1f8f4e" />
        <path
          d="M104 118c6-18 22-28 48-28s42 10 48 28"
          fill="#fff"
          stroke="#d7e5db"
        />
      </g>
      <g className="illust-float-delayed">
        <rect x="188" y="58" width="86" height="64" rx="18" fill="#25D366" />
        <path
          d="M208 82h46M208 96h34"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

export function WhatsAppSparkScene({ className = "" }: SceneProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-hidden
    >
      <circle cx="60" cy="60" r="52" fill="#e8f6ec" className="illust-pulse-ring" />
      <circle cx="60" cy="60" r="36" fill="#25D366" className="illust-bob" />
      <path
        d="M42 62c8 14 28 18 40 8l8 8-2-12c8-10 6-26-4-34-12-10-30-8-38 6-4 7-5 14-4 20z"
        fill="#fff"
        opacity="0.95"
      />
    </svg>
  );
}

export function GeminiSparkScene({ className = "" }: SceneProps) {
  return (
    <svg
      viewBox="0 0 140 100"
      className={className}
      role="img"
      aria-hidden
    >
      <rect width="140" height="100" rx="20" fill="#eef6f0" />
      <g className="illust-spark">
        <path
          d="M70 22l6 16 16 6-16 6-6 16-6-16-16-6 16-6z"
          fill="#1f8f4e"
        />
      </g>
      <rect x="28" y="68" width="84" height="10" rx="5" fill="#d5e8da" />
    </svg>
  );
}

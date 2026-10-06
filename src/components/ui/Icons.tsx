import { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...p,
});

export const ArrowRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);
export const ArrowLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const Menu = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 7h18M3 12h18M3 17h12" />
  </svg>
);
export const Close = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
);
export const Ship = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 15l2 4h14l2-4H3z" />
    <path d="M6 15V9h12v6M9 9V6h4v3" />
    <path d="M2 21c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1" />
  </svg>
);
export const Plane = (p: P) => (
  <svg {...base(p)}>
    <path d="M10.5 13.5 3 11l1.5-1.5 8 .5 4-4c1-1 2.6-1.4 3.2-.7.7.6.3 2.2-.7 3.2l-4 4 .5 8L14 21l-2.5-7.5" />
  </svg>
);
export const Truck = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 6h11v10H2zM13 9h4.5l3.5 3.5V16h-8" />
    <circle cx="6" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
);
export const Box = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9z" />
    <path d="M3 7.5 12 12l9-4.5M12 12v9" />
  </svg>
);
export const Warehouse = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 21V9l9-5 9 5v12" />
    <path d="M7 21v-8h10v8M7 16h10" />
  </svg>
);
export const Shield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </svg>
);
export const Pin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const Phone = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
  </svg>
);
export const Mail = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="m3.5 6 8.5 7 8.5-7" />
  </svg>
);
export const Check = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);
export const Anchor = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v14M8 11h8M4 14a8 8 0 0 0 16 0" />
  </svg>
);
export const Crane = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 21V4h2v17M3 21h8M7 5h14l-3 2H7M16 7v5" />
    <rect x="14" y="12" width="4" height="3" />
  </svg>
);
export const Doc = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4M9 12h6M9 16h6" />
  </svg>
);
export const Leaf = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z" />
    <path d="M5 19 13 11" />
  </svg>
);
export const Play = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 5v14l11-7z" />
  </svg>
);
export const Pause = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 5v14M16 5v14" />
  </svg>
);
export const Reset = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />
  </svg>
);

/* Ícones do sistema SaúdePlus.
   Todos herdam a cor via `currentColor` e aceitam `size` e props de SVG. */

const base = (size, { style, ...rest }) => ({
  width: size,
  height: size,
  "aria-hidden": true,
  focusable: "false",
  style: { display: "block", flexShrink: 0, ...style },
  ...rest,
});

export function SearchIcon({ size = 30, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" {...base(size, props)}>
      <circle cx="10.5" cy="10.5" r="7.5" />
      <path d="m16.2 16.2 5.3 5.3" />
    </svg>
  );
}

export function MenuIcon({ size = 26, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...base(size, props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 24, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" {...base(size, props)}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon({ size = 24, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...base(size, props)}>
      <path d="m5.5 12.5 4.2 4.2 8.8-9" />
    </svg>
  );
}

export function CalendarIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 40 40" {...base(size, props)}>
      <rect x="3" y="7" width="34" height="30" rx="5" fill="none" stroke="currentColor" strokeWidth="3.2" />
      <path d="M3 12a5 5 0 0 1 5-5h24a5 5 0 0 1 5 5v4H3z" fill="currentColor" />
      <rect x="11" y="2.5" width="3.4" height="8" rx="1.7" fill="currentColor" />
      <rect x="25.6" y="2.5" width="3.4" height="8" rx="1.7" fill="currentColor" />
      <g fill="currentColor">
        <rect x="10" y="20.5" width="4.6" height="4.6" rx="1" />
        <rect x="17.7" y="20.5" width="4.6" height="4.6" rx="1" />
        <rect x="25.4" y="20.5" width="4.6" height="4.6" rx="1" />
        <rect x="10" y="28" width="4.6" height="4.6" rx="1" />
        <rect x="17.7" y="28" width="4.6" height="4.6" rx="1" />
        <rect x="25.4" y="28" width="4.6" height="4.6" rx="1" />
      </g>
    </svg>
  );
}

export function UsersIcon({ size = 54, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
      <circle cx="12" cy="7.3" r="3.2" />
      <path d="M6.3 19.2c0-3.4 2.5-6 5.7-6s5.7 2.6 5.7 6z" />
      <circle cx="5.3" cy="9" r="2.4" />
      <path d="M.8 18.4c0-2.7 1.9-4.7 4.4-4.7.9 0 1.6.2 2.3.6-1.3 1.3-2 3-2.1 4.9z" />
      <circle cx="18.7" cy="9" r="2.4" />
      <path d="M23.2 18.4c0-2.7-1.9-4.7-4.4-4.7-.9 0-1.6.2-2.3.6 1.3 1.3 2 3 2.1 4.9z" />
    </svg>
  );
}

export function ShieldHeartIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, props)}>
      <path fill="currentColor" d="M12 1.8 3.6 5v6.2c0 5.3 3.6 9.7 8.4 11 4.8-1.3 8.4-5.7 8.4-11V5z" />
      <path fill="#fff" d="M12 16.2c-3-1.9-4.6-3.6-4.6-5.4 0-1.4 1-2.4 2.3-2.4.9 0 1.8.5 2.3 1.3.5-.8 1.4-1.3 2.3-1.3 1.3 0 2.3 1 2.3 2.4 0 1.8-1.6 3.5-4.6 5.4z" />
    </svg>
  );
}

export function HeartIcon({ size = 46, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
      <path d="M12 21C5.4 16.5 2.2 12.9 2.2 8.9 2.2 6 4.4 3.7 7.2 3.7c2 0 3.7 1 4.8 2.7 1.1-1.7 2.8-2.7 4.8-2.7 2.8 0 5 2.3 5 5.2 0 4-3.2 7.6-9.8 12.1z" />
    </svg>
  );
}

export function HeartOutlineIcon({ size = 42, ...props }) {
  return (
    <svg viewBox="0 0 42 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...base(size, props)} height={(size * 40) / 42}>
      <path d="M21 36C8 27.5 3 21 3 13.5 3 8 7 4 12 4c3.8 0 7 2.2 9 5.4C23 6.2 26.2 4 30 4c5 0 9 4 9 9.5C39 21 34 27.5 21 36z" />
    </svg>
  );
}

export function StarIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
      <path d="M12 1.8l3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.6l-6.3 3.3 1.2-6.9-5-4.9 7-1z" />
    </svg>
  );
}

/* ---------- Ícones de linha (stroke) ---------- */
const Stroke = ({ size, sw = 2, children, props, viewBox = "0 0 24 24" }) => (
  <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...base(size, props)}>
    {children}
  </svg>
);

export const ChevronRightIcon = ({ size = 24, ...props }) => <Stroke size={size} sw={2.4} props={props}><path d="m9 5 7 7-7 7" /></Stroke>;
export const ChevronDownIcon = ({ size = 20, ...props }) => <Stroke size={size} sw={2.4} props={props}><path d="m5 9 7 7 7-7" /></Stroke>;
export const RefreshIcon = ({ size = 16, ...props }) => <Stroke size={size} sw={2.2} props={props}><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></Stroke>;
export const ClockOutlineIcon = ({ size = 16, ...props }) => <Stroke size={size} sw={2.2} props={props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Stroke>;
export const MapPinIcon = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
    <path d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.3 6.2 11.6 6.9 12.3a.85.85 0 0 0 1.2 0c.7-.7 6.9-7 6.9-12.3A7.5 7.5 0 0 0 12 2zm0 10.3a2.9 2.9 0 1 1 0-5.8 2.9 2.9 0 0 1 0 5.8z" />
  </svg>
);
export const StethoscopeIcon = ({ size = 36, ...props }) => (
  <Stroke size={size} sw={2.2} props={props}>
    <path d="M5 3H4v6a5 5 0 0 0 10 0V3h-1" />
    <path d="M9 14v2a5 5 0 0 0 10 0v-2.5" />
    <circle cx="19" cy="11" r="2.2" />
  </Stroke>
);
export const FilterIcon = ({ size = 26, ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
    <rect x="2" y="3" width="20" height="3.2" rx="1.2" />
    <rect x="5" y="9" width="14" height="3.2" rx="1.2" />
    <path d="M8.5 15h7l-2 5.5a1.6 1.6 0 0 1-3 0z" />
  </svg>
);
export const VerifiedIcon = ({ size = 20, ...props }) => (
  <svg viewBox="0 0 24 24" {...base(size, props)}>
    <path fill="currentColor" d="m12 1.5 2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3-3.2-.1L12 21.1l-2.6-1.9-3.2.1-1-3-2.6-1.9 1-3.1-1-3.1 2.6-1.9 1-3 3.2.1z" />
    <path fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" d="m7.8 11.6 2.9 2.9 5.5-5.7" />
  </svg>
);
export const BuildingIcon = ({ size = 13, ...props }) => (
  <Stroke size={size} sw={2} props={props}><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4" /></Stroke>
);
export const VideoChatIcon = ({ size = 13, ...props }) => (
  <Stroke size={size} sw={2} props={props}><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8" /></Stroke>
);

/* ---------- Ícones sólidos ---------- */
export function ClockIcon({ size = 26, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, props)}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M12 6.5V12l3.6 2.2" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldCheckIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, props)}>
      <path fill="currentColor" d="M12 1.8 3.6 5v6.2c0 5.3 3.6 9.7 8.4 11 4.8-1.3 8.4-5.7 8.4-11V5z" />
      <path fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" d="m8.2 12 2.7 2.7 5-5.2" />
    </svg>
  );
}

export function HeadsetIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...base(size, props)}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="2.8" y="12.5" width="4.4" height="7" rx="2" fill="currentColor" />
      <rect x="16.8" y="12.5" width="4.4" height="7" rx="2" fill="currentColor" />
      <path d="M19 19.5c0 1.6-2 2.5-5 2.5" />
    </svg>
  );
}

export function UserIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
      <circle cx="12" cy="7.5" r="4.3" />
      <path d="M3.8 21c0-4.6 3.7-8 8.2-8s8.2 3.4 8.2 8z" />
    </svg>
  );
}

export function UserPlusIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
      <circle cx="10" cy="7.5" r="4.3" />
      <path d="M2 21c0-4.6 3.6-8 8-8 1.6 0 3 .4 4.3 1.2A5.5 5.5 0 0 0 14.1 21z" />
      <path d="M18.5 14v7M15 17.5h7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function MagnifierBoldIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" {...base(size, props)}>
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="m16 16 5.5 5.5" />
    </svg>
  );
}

export function DocumentCheckIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, props)}>
      <path fill="currentColor" d="M5 1.5h9.5L20 7v7a6.5 6.5 0 0 0-8.4 8.5H5A1.5 1.5 0 0 1 3.5 21V3A1.5 1.5 0 0 1 5 1.5z" />
      <path fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" d="M7 10h8M7 13.5h5.5M7 17h3" />
      <circle cx="17.8" cy="18.3" r="4.7" fill="currentColor" stroke="#fff" strokeWidth="1.3" />
      <path fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="m15.7 18.4 1.5 1.5 2.7-2.9" />
    </svg>
  );
}

export function MonitorPlayIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, props)}>
      <rect x="1.8" y="3" width="20.4" height="14.5" rx="2" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <path fill="currentColor" d="M9.8 7.3v6l5.2-3z" />
      <path stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" d="M8 21.5h8M12 17.5v4" />
    </svg>
  );
}

export function TargetIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...base(size, props)}>
      <circle cx="11" cy="13" r="9" />
      <circle cx="11" cy="13" r="4.6" />
      <path d="m11 13 9.5-9.5M17 3.5h3.5V7" />
    </svg>
  );
}

export function MountainFlagIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
      <path d="M1.5 22 9 10.5l3 4 2.5-3L22.5 22z" />
      <rect x="10.8" y="2" width="1.6" height="10" rx=".8" />
      <path d="M12 2.2h5.5l-1.6 2.4 1.6 2.4H12z" />
    </svg>
  );
}

export function EyeIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, props)}>
      <path fill="currentColor" d="M12 4.5C6.7 4.5 2.6 8.6 1 12c1.6 3.4 5.7 7.5 11 7.5s9.4-4.1 11-7.5c-1.6-3.4-5.7-7.5-11-7.5z" />
      <circle cx="12" cy="12" r="5" fill="#fff" />
      <circle cx="12" cy="12" r="2.8" fill="currentColor" />
    </svg>
  );
}

export function DiamondIcon({ size = 40, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, props)}>
      <path fill="currentColor" d="M6.5 3h11L22 9l-10 12.5L2 9z" />
      <path fill="none" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" d="M2 9h20M9 3 7.5 9 12 21.5 16.5 9 15 3M7.5 9 12 3l4.5 6" />
    </svg>
  );
}

export function ChartBarsIcon({ size = 36, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
      <rect x="3" y="13" width="4.2" height="8" rx="1.2" />
      <rect x="9.9" y="8" width="4.2" height="13" rx="1.2" />
      <rect x="16.8" y="3" width="4.2" height="18" rx="1.2" />
    </svg>
  );
}

export function BookOpenIcon({ size = 36, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
      <path d="M11 5.2C9 3.8 6 3.3 2.5 3.6A1 1 0 0 0 1.6 4.6v13.3c0 .6.5 1 1.1 1 3-.2 5.8.3 8.3 1.9z" />
      <path d="M13 5.2c2-1.4 5-1.9 8.5-1.6.5 0 .9.5.9 1v13.3c0 .6-.5 1-1.1 1-3-.2-5.8.3-8.3 1.9z" />
    </svg>
  );
}

export function QuestionCircleIcon({ size = 36, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, props)}>
      <circle cx="12" cy="12" r="10.5" fill="currentColor" />
      <path fill="none" stroke="#0A4FC4" strokeWidth="2.6" strokeLinecap="round" d="M9 9.2a3 3 0 1 1 4.3 2.7c-.9.4-1.3 1.1-1.3 2v.6" />
      <circle cx="12" cy="17.6" r="1.5" fill="#0A4FC4" />
    </svg>
  );
}

export function ChatDotsIcon({ size = 36, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, props)}>
      <path fill="currentColor" d="M12 2.5C6.2 2.5 1.5 6.4 1.5 11.2c0 2.5 1.3 4.8 3.4 6.4L4 21.5l4.6-2.3c1 .3 2.2.4 3.4.4 5.8 0 10.5-3.9 10.5-8.4S17.8 2.5 12 2.5z" />
      <g fill="#0A4FC4"><circle cx="7.5" cy="11.2" r="1.6" /><circle cx="12" cy="11.2" r="1.6" /><circle cx="16.5" cy="11.2" r="1.6" /></g>
    </svg>
  );
}

export function FileTextIcon({ size = 36, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, props)}>
      <path fill="currentColor" d="M6 1.5h8L20 7.5V21a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 5 21V3A1.5 1.5 0 0 1 6 1.5z" />
      <path fill="none" stroke="#0A4FC4" strokeWidth="1.9" strokeLinecap="round" d="M8.5 12h7M8.5 15.5h7M8.5 19h4.5" />
    </svg>
  );
}

export function MailIcon({ size = 26, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, props)}>
      <rect x="2" y="4.5" width="20" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2.3" />
      <path fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round" d="m3 6.5 9 7 9-7" />
    </svg>
  );
}

export function PhoneIcon({ size = 26, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
      <path d="M6.6 2.3c.6-.2 1.2 0 1.6.5l2.3 3.3c.4.6.4 1.4-.1 1.9L8.9 9.5a12.4 12.4 0 0 0 5.6 5.6l1.5-1.5c.5-.5 1.3-.6 1.9-.1l3.3 2.3c.5.4.7 1 .5 1.6l-.8 2.6c-.3.9-1.1 1.5-2 1.4C10 20.8 3.2 14 2.6 5.1c-.1-.9.5-1.8 1.4-2z" />
    </svg>
  );
}

/* ---------- Especialidades ---------- */
export const SpecStethoscopeIcon = ({ size = 34, ...props }) => (
  <Stroke size={size} sw={2.4} props={props}>
    <path d="M6 2.5H4.5v6.5a5 5 0 0 0 10 0V2.5H13" />
    <path d="M9.5 14v1.5a5.5 5.5 0 0 0 11 0V13" />
    <circle cx="20.5" cy="10.5" r="2.2" />
  </Stroke>
);
export const ChildIcon = ({ size = 34, ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
    <circle cx="12" cy="4.3" r="3" />
    <path d="M7 9.4c0-1 .8-1.9 1.9-1.9h6.2c1.1 0 1.9.9 1.9 1.9l2.4 4.3a1.3 1.3 0 0 1-2.2 1.3L15.5 12v9.3a1.7 1.7 0 0 1-3.4 0v-4.8h-.2v4.8a1.7 1.7 0 0 1-3.4 0V12L6.7 15a1.3 1.3 0 0 1-2.2-1.3z" />
  </svg>
);
export const FemaleIcon = ({ size = 34, ...props }) => (
  <Stroke size={size} sw={2.8} props={props}><circle cx="12" cy="8.5" r="6" /><path d="M12 14.5V23M8 19h8" /></Stroke>
);
export const HeartPulseIcon = ({ size = 38, ...props }) => (
  <svg viewBox="0 0 24 24" {...base(size, props)}>
    <path fill="currentColor" d="M12 21.5C5.3 17 1.8 13.2 1.8 8.9 1.8 5.9 4.1 3.5 7 3.5c2.1 0 3.9 1 5 2.8 1.1-1.8 2.9-2.8 5-2.8 2.9 0 5.2 2.4 5.2 5.4 0 4.3-3.5 8.1-10.2 12.6z" />
    <path fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M3.5 11.5h4.2l1.6-3 2.4 6 2-4.2 1.3 1.2h5.5" />
  </svg>
);
export const SkinIcon = ({ size = 38, ...props }) => (
  <svg viewBox="0 0 24 24" {...base(size, props)}>
    <path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" d="M1.5 14.5c3.5-1.5 6-1.5 10.5 0s7 1.5 10.5 0" />
    <path fill="currentColor" d="M12 15.5c-1.6 0-2.7-1.3-2.7-3 0-2.2 1.6-3.3 2.7-5.2V2c1.3 2.2 2.2 3.3 2.2 5.3v5.2c0 1.7-.9 3-2.2 3z" />
    <g fill="currentColor"><circle cx="3.5" cy="19.5" r="1.2" /><circle cx="7.5" cy="19.5" r="1.2" /><circle cx="12" cy="19.5" r="1.2" /><circle cx="16.5" cy="19.5" r="1.2" /><circle cx="20.5" cy="19.5" r="1.2" /></g>
  </svg>
);
export const BoneIcon = ({ size = 36, ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
    <path d="M17.6 2.2a3.3 3.3 0 0 1 3.1 3.1 3.3 3.3 0 0 1 .7 5.8 3.3 3.3 0 0 1-4.3.7l-4.8 4.8a3.3 3.3 0 0 1-.7 4.3 3.3 3.3 0 0 1-5.8-.7 3.3 3.3 0 0 1-3.1-3.1 3.3 3.3 0 0 1-.7-5.8 3.3 3.3 0 0 1 4.3-.7l4.8-4.8a3.3 3.3 0 0 1 .7-4.3 3.3 3.3 0 0 1 5.8.7z" />
  </svg>
);
export const BrainIcon = ({ size = 38, ...props }) => (
  <svg viewBox="0 0 24 24" {...base(size, props)}>
    <path fill="currentColor" d="M9 2.3c-2 0-3.5 1.3-3.8 3C3.4 5.8 2.2 7.5 2.4 9.4 1.3 10.3.9 12 1.6 13.5c-.4 2 .7 3.9 2.6 4.5.4 2.2 2.4 3.7 4.6 3.5.8.8 2 .9 3.2.4V3c-.8-.5-1.9-.7-3-.7zm6 0c2 0 3.5 1.3 3.8 3 1.8.5 3 2.2 2.8 4.1 1.1.9 1.5 2.6.8 4.1.4 2-.7 3.9-2.6 4.5-.4 2.2-2.4 3.7-4.6 3.5-.8.8-2 .9-3.2.4V3c.8-.5 1.9-.7 3-.7z" />
    <path fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" d="M12 3v19M6.5 7.5c1.5 0 2.5 1 2.5 2.5M4.5 12.5c1.5-.5 3 0 3.8 1.5M7 17.5c.5-1.5 2-2.2 3.5-2M17.5 7.5c-1.5 0-2.5 1-2.5 2.5M19.5 12.5c-1.5-.5-3 0-3.8 1.5M17 17.5c-.5-1.5-2-2.2-3.5-2" />
  </svg>
);
export const MoleculeIcon = ({ size = 36, ...props }) => (
  <svg viewBox="0 0 24 24" {...base(size, props)}>
    <path stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" d="M5 5l6 6.5M18.5 4.5 13 11M12 13l-6.5 6M13 13l6 6" />
    <g fill="currentColor"><circle cx="12" cy="12" r="3.2" /><circle cx="4.3" cy="4.3" r="2.6" /><circle cx="19.5" cy="4" r="2.2" /><circle cx="4.5" cy="19.8" r="2.3" /><circle cx="19.7" cy="19.7" r="2.6" /></g>
  </svg>
);
export const ToothIcon = ({ size = 36, ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
    <path d="M7.2 1.8c1.8 0 3 .9 4.8.9s3-.9 4.8-.9c3 0 4.9 2.4 4.9 5.6 0 2.3-1 4-1.6 6.1-.8 2.8-1 8.7-3.8 8.7-2.2 0-2-5.8-4.3-5.8s-2.1 5.8-4.3 5.8c-2.8 0-3-5.9-3.8-8.7C3.3 11.4 2.3 9.7 2.3 7.4c0-3.2 1.9-5.6 4.9-5.6z" />
  </svg>
);
export const LungsIcon = ({ size = 38, ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
    <path d="M11 1.8h2v8.4l2.3 2.2-1.4 1.4L12 12l-1.9 1.8-1.4-1.4L11 10.2z" />
    <path d="M8.4 6.1c.9-.5 1.6.3 1.6 1.2v12.6c0 1.6-1.5 2.6-3.1 2.3L4 21.6c-1.7-.3-2.8-1.9-2.5-3.6.8-5.6 3.2-10.2 6.9-11.9zM15.6 6.1c-.9-.5-1.6.3-1.6 1.2v12.6c0 1.6 1.5 2.6 3.1 2.3l2.9-.6c1.7-.3 2.8-1.9 2.5-3.6-.8-5.6-3.2-10.2-6.9-11.9z" />
  </svg>
);
export const AppleIcon = ({ size = 36, ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
    <path d="M16.5 7c-1.7 0-2.9.9-4.5.9S9.3 7 7.5 7C4.7 7 2.5 9.4 2.5 13c0 4.7 3.3 9.5 6 9.5 1.4 0 2.1-.8 3.5-.8s2.1.8 3.5.8c2.7 0 6-4.8 6-9.5 0-3.6-2.2-6-5-6z" />
    <path d="M12.3 6.3C11.8 3.9 13 2 15.5 1.5c.3 2.4-1 4.4-3.2 4.8z" />
  </svg>
);


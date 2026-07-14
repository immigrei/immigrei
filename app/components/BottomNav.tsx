"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/dashboard",
    label: "Início",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
      </svg>
    ),
  },
  {
    href: "/painel",
    label: "Painel",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 17L7 13L11 15L17 9L21 11"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="13" r={active ? 2 : 1.5} fill="currentColor" />
        <circle cx="11" cy="15" r={active ? 2 : 1.5} fill="currentColor" />
        <circle cx="17" cy="9" r={active ? 2 : 1.5} fill="currentColor" />
        <circle cx="21" cy="11" r={active ? 2 : 1.5} fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/documentos",
    label: "Documentos",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="4" y="2" width="12" height="16" rx="2"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.1 : 0}
        />
        <path d="M8 7H12M8 10H14M8 13H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 2V6H18L14 2Z" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinejoin="round" />
        <rect x="10" y="12" width="10" height="10" rx="5" fill="var(--pine)" />
        <path d="M13 17L14.5 18.5L17 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/comunidade",
    label: "Comunidade",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="8.5" cy="8" r="3.5"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
        <path
          d="M2 19.5C2 16.7386 4.91015 14.5 8.5 14.5C12.0899 14.5 15 16.7386 15 19.5"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
        />
        <path
          d="M15.5 5.1C16.9459 5.6 18 6.98 18 8.6C18 10.22 16.9459 11.6 15.5 12.1M18.5 19.5C21 18.5 22 16.5 20.5 14.8"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/profissionais",
    label: "Profissionais",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="9" cy="7" r="3.5"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
        <path
          d="M2 20C2 16.6863 5.13401 14 9 14C10.0112 14 10.9686 14.1942 11.8408 14.5479"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
        />
        <circle
          cx="17" cy="17" r="4"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
        <path d="M17 15V17L18.5 18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-cream-2 border-t border-pine-tint safe-area-pb">
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors"
              style={{ color: active ? "var(--pine)" : "var(--ink-faint)" }}
            >
              {tab.icon(active)}
              <span
                className="text-[10px] font-bold uppercase tracking-wide leading-none"
                style={{ letterSpacing: "0.06em" }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

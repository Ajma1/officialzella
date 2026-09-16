"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeFinePointer(callback: () => void) {
  const query = window.matchMedia(FINE_POINTER_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function getFinePointerServerSnapshot() {
  return false;
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const enabled = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot,
  );

  useEffect(() => {
    if (!enabled) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { ...pos };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const el = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-cursor-label]",
      );
      setLabel(el?.dataset.cursorLabel ?? null);
    };

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.25;
      pos.y += (target.y - pos.y) * 0.25;
      dotRef.current?.style.setProperty(
        "transform",
        `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      );
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed left-0 top-0 z-[100] will-change-transform"
    >
      <svg
        width="22"
        height="20"
        viewBox="0 0 24 22"
        fill="none"
        className={`absolute -left-1 -top-1 drop-shadow-[0_2px_3px_rgba(200,24,70,0.4)] transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
          label
            ? "scale-[0.3] opacity-0 blur-[4px]"
            : "scale-100 opacity-100 blur-none"
        }`}
      >
        <path
          d="M12 20.5c-.3 0-.6-.1-.8-.3C7.6 17 3.5 13.2 3.5 9.1 3.5 6.3 5.7 4 8.5 4c1.5 0 2.9.7 3.5 1.8C12.6 4.7 14 4 15.5 4 18.3 4 20.5 6.3 20.5 9.1c0 4.1-4.1 7.9-7.7 11.1-.2.2-.5.3-.8.3Z"
          fill="#c81846"
          stroke="#fff8ef"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>

      <div
        className={`absolute left-4 top-4 origin-top-left whitespace-nowrap rounded-full bg-[#c81846] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#fff8ef] shadow-md transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
          label
            ? "scale-100 opacity-100 blur-none"
            : "scale-[0.3] opacity-0 blur-[4px]"
        }`}
      >
        {label}
      </div>
    </div>
  );
}

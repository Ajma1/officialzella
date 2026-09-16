/** The hand-drawn underline stroke that sits beneath the accent word in a
 *  display heading. Colour comes from the parent via `currentColor`. */
export default function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 140 18"
      className={className ?? "absolute -bottom-1.5 left-0 h-3 w-full text-cherry"}
    >
      <path
        d="M2 12C24 2 46 2 68 9C90 16 112 16 136 6"
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

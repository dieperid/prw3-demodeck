type ViewModeToggleProps = {
  value: "gallery" | "list";
  onChange: (value: "gallery" | "list") => void;
};

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex self-start items-center rounded-2xl border border-stone-300 bg-white p-1 shadow-sm">
      <button
        aria-label="Gallery view"
        className={`rounded-xl p-2 transition ${
          value === "gallery"
            ? "bg-stone-950 text-white"
            : "text-stone-600 hover:text-stone-950"
        }`}
        onClick={() => onChange("gallery")}
        title="Gallery view"
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <rect height="7" rx="1.5" width="7" x="3" y="3" />
          <rect height="7" rx="1.5" width="7" x="14" y="3" />
          <rect height="7" rx="1.5" width="7" x="3" y="14" />
          <rect height="7" rx="1.5" width="7" x="14" y="14" />
        </svg>
      </button>
      <button
        aria-label="List view"
        className={`rounded-xl p-2 transition ${
          value === "list"
            ? "bg-stone-950 text-white"
            : "text-stone-600 hover:text-stone-950"
        }`}
        onClick={() => onChange("list")}
        title="List view"
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <line x1="8" x2="21" y1="6" y2="6" />
          <line x1="8" x2="21" y1="12" y2="12" />
          <line x1="8" x2="21" y1="18" y2="18" />
          <circle cx="4.5" cy="6" r="1.5" />
          <circle cx="4.5" cy="12" r="1.5" />
          <circle cx="4.5" cy="18" r="1.5" />
        </svg>
      </button>
    </div>
  );
}

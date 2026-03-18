type InfoBlockProps = {
  label: string;
  value: string;
};

export function InfoBlock({ label, value }: InfoBlockProps) {
  return (
    <div className="rounded-2xl bg-stone-100 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 break-all text-sm text-stone-700">{value}</p>
    </div>
  );
}

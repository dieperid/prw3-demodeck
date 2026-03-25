type SortSelectProps = {
  value: "date" | "likes";
  onChange: (value: "date" | "likes") => void;
};

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-stone-700">Sort</span>
      <select
        className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
        onChange={(event) => onChange(event.target.value as "date" | "likes")}
        value={value}
      >
        <option value="date">Date</option>
        <option value="likes">Likes</option>
      </select>
    </label>
  );
}

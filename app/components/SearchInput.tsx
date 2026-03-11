type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-stone-700">Search</span>
      <input
        className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Title, tech, author..."
        type="search"
        value={value}
      />
    </label>
  );
}

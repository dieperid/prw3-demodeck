type TagFiltersProps = {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
};

export function TagFilters({
  tags,
  selectedTags,
  onToggleTag,
}: TagFiltersProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-stone-700">Tags filters</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            className={`rounded-full border px-4 py-2 text-sm transition ${
              selectedTags.includes(tag)
                ? "border-stone-950 bg-stone-950 text-white"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-950 hover:text-stone-950"
            }`}
            key={tag}
            onClick={() => onToggleTag(tag)}
            type="button"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

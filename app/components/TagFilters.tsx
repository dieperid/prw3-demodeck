type TagFiltersProps = {
  tags: string[];
};

export function TagFilters({ tags }: TagFiltersProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-stone-700">Tags filters</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

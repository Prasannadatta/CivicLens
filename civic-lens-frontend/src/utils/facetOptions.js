export function facetToOptions(facets, field, numeric = false) {
  const values = Array.isArray(facets?.[field]) ? facets[field] : [];
  const unique = [...new Set(values.map(String))];
  if (numeric) unique.sort((a, b) => Number(b) - Number(a));
  else unique.sort((a, b) => a.localeCompare(b));
  return ['All', ...unique];
}

/** Keep "All" and ensure the active selection always appears in the list. */
export function facetToOptionsWithSelection(facets, field, selectedValue, numeric = false) {
  const options = facetToOptions(facets, field, numeric);
  if (!selectedValue || selectedValue === 'All') return options.length ? options : ['All'];
  if (options.includes(selectedValue)) return options;
  const rest = options.filter((option) => option !== 'All' && option !== selectedValue);
  return ['All', selectedValue, ...rest];
}

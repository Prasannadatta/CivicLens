import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const DEFAULT_FILTERS = {
  borough: 'All',
  complaint_type: 'All',
  agency: 'All',
  delay_bucket: 'All',
  status: 'All',
};

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pendingModelCaseKey, setPendingModelCaseKey] = useState(null);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const value = useMemo(() => ({
    filters,
    handleFilterChange,
    resetFilters,
    setFilters,
    pendingModelCaseKey,
    setPendingModelCaseKey,
  }), [filters, handleFilterChange, resetFilters, pendingModelCaseKey]);

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return ctx;
}

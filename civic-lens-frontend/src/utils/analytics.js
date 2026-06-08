function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatHours(hours) {
  const value = num(hours);
  if (value <= 0) return '0m';
  if (value < 1) return `${Math.round(value * 60)}m`;
  if (value < 24) return `${value.toFixed(1)}h`;
  return `${(value / 24).toFixed(1)}d`;
}

export function formatDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

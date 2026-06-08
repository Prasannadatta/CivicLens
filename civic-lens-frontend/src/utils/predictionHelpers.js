/** @param {number} hours */
export function getPredictedDelayBucket(hours) {
  const h = Math.max(0, Number(hours) || 0);
  if (h < 24) return 'Same Day';
  if (h < 72) return '1–3 Days';
  if (h < 168) return '3–7 Days';
  return 'More than 1 Week';
}

/** @param {number} hours */
export function getPredictionRiskLevel(hours) {
  const h = Math.max(0, Number(hours) || 0);
  if (h < 24) return 'Low';
  if (h < 72) return 'Medium';
  if (h < 168) return 'High';
  return 'Critical';
}

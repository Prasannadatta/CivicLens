import { formatHours } from './analytics';

function isActive(value) {
  return value != null && value !== '' && value !== 'All';
}

function buildAreaInsight(areaName, topComplaint, avgResponseHours, unresolvedRate) {
  if (!areaName || areaName === '—') {
    return 'Select a borough on the map to see area-specific insights.';
  }
  const complaint = topComplaint || 'mixed complaint types';
  const unresolvedPct = (unresolvedRate * 100).toFixed(1);
  return `${areaName} shows higher burden mainly because ${complaint} requests have longer response times (${formatHours(avgResponseHours)}) and a ${unresolvedPct}% unresolved rate.`;
}

export function buildAreaSummary(filters, boroughStats, complaintStats, stats) {
  if (!boroughStats?.length) {
    return {
      areaName: '—',
      isDefault: true,
      totalRequests: 0,
      avgResponseHours: 0,
      unresolvedRate: 0,
      highDelayCount: 0,
      topComplaintType: '—',
      topAgency: '—',
      insight: 'No requests match the current filters.',
    };
  }

  const selectedBorough = isActive(filters.borough) ? filters.borough : null;
  const areaName = selectedBorough ?? boroughStats[0]?.borough ?? '—';
  const boroughEntry = boroughStats.find((entry) => entry.borough === areaName) ?? boroughStats[0];

  return {
    areaName,
    isDefault: !selectedBorough,
    totalRequests: boroughEntry?.count ?? stats?.totalRequests ?? 0,
    avgResponseHours: boroughEntry?.avgResponseHours ?? stats?.avgResponseHours ?? 0,
    unresolvedRate: boroughEntry?.unresolvedRate ?? stats?.unresolvedRate ?? 0,
    highDelayCount: boroughEntry?.highDelayCount ?? stats?.highDelayCount ?? 0,
    topComplaintType: complaintStats?.[0]?.complaintType ?? '—',
    topAgency: '—',
    insight: buildAreaInsight(
      areaName,
      complaintStats?.[0]?.complaintType,
      boroughEntry?.avgResponseHours ?? 0,
      boroughEntry?.unresolvedRate ?? 0,
    ),
  };
}

export function buildDelayDrivers(complaintStats) {
  if (!complaintStats?.length) return [];

  const drivers = [];
  const slowestComplaint = [...complaintStats].sort(
    (a, b) => b.avgResponseHours - a.avgResponseHours,
  )[0];
  if (slowestComplaint) {
    drivers.push({
      key: 'complaint_delay',
      label: 'Slowest complaint type',
      value: slowestComplaint.complaintType,
      detail: `${formatHours(slowestComplaint.avgResponseHours)} avg · ${slowestComplaint.count.toLocaleString()} requests`,
      score: slowestComplaint.avgResponseHours,
    });
  }

  const unresolvedHeavy = [...complaintStats].sort(
    (a, b) => b.unresolvedRate - a.unresolvedRate,
  )[0];
  if (unresolvedHeavy && unresolvedHeavy.unresolvedRate > 0) {
    drivers.push({
      key: 'unresolved',
      label: 'Unresolved-heavy category',
      value: unresolvedHeavy.complaintType,
      detail: `${(unresolvedHeavy.unresolvedRate * 100).toFixed(1)}% unresolved`,
      score: unresolvedHeavy.unresolvedRate,
    });
  }

  const highestVolume = complaintStats[0];
  if (highestVolume) {
    drivers.push({
      key: 'volume',
      label: 'Highest-volume category',
      value: highestVolume.complaintType,
      detail: `${highestVolume.count.toLocaleString()} requests in slice`,
      score: highestVolume.count,
    });
  }

  return drivers
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

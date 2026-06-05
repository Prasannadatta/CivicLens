const BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

const BOROUGH_CONFIG = {
  Manhattan: {
    lat: [40.705, 40.882],
    lng: [-74.018, -73.907],
    zips: ['10001', '10003', '10009', '10011', '10016', '10019', '10021', '10026', '10029', '10036'],
    weight: 0.2,
    streets: ['BROADWAY', '7 AVENUE', 'LEXINGTON AVENUE', 'AMSTERDAM AVENUE', 'HOUSTON STREET', 'CANAL STREET'],
    cbPrefix: 'MANHATTAN',
  },
  Brooklyn: {
    lat: [40.551, 40.739],
    lng: [-74.042, -73.833],
    zips: ['11201', '11205', '11211', '11215', '11217', '11221', '11226', '11232', '11238', '11249'],
    weight: 0.3,
    streets: ['FLATBUSH AVENUE', 'ATLANTIC AVENUE', 'BEDFORD AVENUE', 'FULTON STREET', '4 AVENUE', 'CONEY ISLAND AVENUE'],
    cbPrefix: 'BROOKLYN',
  },
  Queens: {
    lat: [40.541, 40.8],
    lng: [-73.962, -73.7],
    zips: ['11101', '11354', '11368', '11373', '11375', '11432', '11435', '11691', '11694', '11004'],
    weight: 0.28,
    streets: ['QUEENS BOULEVARD', 'JAMAICA AVENUE', 'ROOSEVELT AVENUE', 'NORTHERN BOULEVARD', 'STEINWAY STREET', 'MAIN STREET'],
    cbPrefix: 'QUEENS',
  },
  Bronx: {
    lat: [40.785, 40.917],
    lng: [-73.933, -73.748],
    zips: ['10451', '10452', '10457', '10458', '10463', '10467', '10472', '10473', '10475', '10468'],
    weight: 0.17,
    streets: ['GRAND CONCOURSE', 'BOSTON ROAD', 'WHITE PLAINS ROAD', 'JEROME AVENUE', 'WEBSTER AVENUE', 'EAST TREMONT AVENUE'],
    cbPrefix: 'BRONX',
  },
  'Staten Island': {
    lat: [40.496, 40.651],
    lng: [-74.255, -74.052],
    zips: ['10301', '10304', '10305', '10306', '10308', '10312', '10314'],
    weight: 0.05,
    streets: ['HYLAN BOULEVARD', 'RICHMOND AVENUE', 'VICTORY BOULEVARD', 'FOREST AVENUE', 'BAY STREET', 'NEW DORP LANE'],
    cbPrefix: 'STATEN ISLAND',
  },
};

const AGENCIES = {
  NYPD: 'New York City Police Department',
  DSNY: 'Department of Sanitation',
  DOT: 'Department of Transportation',
  DEP: 'Department of Environmental Protection',
  HPD: 'Department of Housing Preservation and Development',
  DPR: 'Department of Parks and Recreation',
};

const COMPLAINT_CATALOG = [
  {
    type: 'Noise - Street/Sidewalk',
    agency: 'NYPD',
    descriptors: ['Loud Talking', 'Loud Music', 'Car/Truck Horn', 'Banging/Pounding', 'Loud Party'],
    weight: 0.14,
    baseUrgency: 0.15,
  },
  {
    type: 'Illegal Parking',
    agency: 'NYPD',
    descriptors: ['Double Parked', 'Blocked Hydrant', 'Posted Parking Sign Violation', 'Commercial Overnight Parking'],
    weight: 0.11,
    baseUrgency: 0.2,
  },
  {
    type: 'HEAT/HOT WATER',
    agency: 'HPD',
    descriptors: ['No Heat', 'Insufficient Heat', 'Apartment - Heat', 'Building-Wide - Hot Water'],
    weight: 0.1,
    baseUrgency: 0.85,
    seasonalBoost: { Winter: 0.15, Fall: 0.08 },
  },
  {
    type: 'Street Condition',
    agency: 'DOT',
    descriptors: ['Pothole', 'Damaged Sidewalk', 'Cave-In', 'Asphalt Condition'],
    weight: 0.12,
    baseUrgency: 0.45,
  },
  {
    type: 'Water Leak',
    agency: 'DEP',
    descriptors: ['Leak', 'Heavy Flow', 'Small Leak', 'Hydrant Leaking'],
    weight: 0.08,
    baseUrgency: 0.7,
  },
  {
    type: 'Sanitation Condition',
    agency: 'DSNY',
    descriptors: ['Missed Collection', 'Dirty Conditions', 'Rodent', 'Overflowing Litter Basket'],
    weight: 0.1,
    baseUrgency: 0.35,
  },
  {
    type: 'Blocked Driveway',
    agency: 'NYPD',
    descriptors: ['Blocked', 'Partially Blocked', 'Vehicle Blocking Driveway'],
    weight: 0.07,
    baseUrgency: 0.4,
  },
  {
    type: 'Street Light Condition',
    agency: 'DOT',
    descriptors: ['Street Light Out', 'Flickering Light', 'Damaged Pole', 'Wire Down'],
    weight: 0.07,
    baseUrgency: 0.5,
  },
  {
    type: 'Tree Condition',
    agency: 'DPR',
    descriptors: ['Dead Tree', 'Overgrown Branches', 'Damaged Tree', 'Root Damage'],
    weight: 0.06,
    baseUrgency: 0.4,
  },
  {
    type: 'Sewer',
    agency: 'DEP',
    descriptors: ['Sewer Backup', 'Sewer Odor', 'Catch Basin Blocked', 'Manhole Overflow'],
    weight: 0.07,
    baseUrgency: 0.75,
  },
  {
    type: 'Graffiti',
    agency: 'DSNY',
    descriptors: ['Building', 'Storefront', 'Sign', 'Private Property'],
    weight: 0.04,
    baseUrgency: 0.1,
  },
  {
    type: 'Illegal Dumping',
    agency: 'DSNY',
    descriptors: ['Bulk Items', 'Construction Debris', 'Household Trash', 'Tires'],
    weight: 0.04,
    baseUrgency: 0.55,
  },
];

const RESOLUTIONS = {
  closed: [
    'Your request was successfully resolved by the assigned agency.',
    'A field inspection was conducted and corrective action was taken.',
    'The condition was verified and scheduled for repair.',
    'The Department of Sanitation responded and addressed the condition.',
    'The Police Department reviewed your complaint and provided additional information below.',
  ],
  vague: [
    'The complaint was referred to the appropriate unit for follow-up.',
    'Additional information is needed to proceed with this request.',
    'The agency reviewed the complaint and closed the request after inspection.',
  ],
  open: [
    'Request is pending assignment to a field unit.',
    'Inspection scheduled; awaiting agency response.',
    'Complaint received and under review.',
  ],
};

const CHANNELS = ['ONLINE', 'MOBILE', 'PHONE', 'UNKNOWN'];

const AGENCY_BASE_HOURS = {
  NYPD: 14,
  DSNY: 38,
  DOT: 52,
  DEP: 68,
  HPD: 82,
  DPR: 34,
};

const SHAP_FACTOR_DEFS = [
  { feature: 'agency_complaint_median', label: 'Agency + complaint historical delay', weight: 0.32 },
  { feature: 'agency_zip_median', label: 'Agency + ZIP historical delay', weight: 0.18 },
  { feature: 'agency_workload_24h', label: 'Recent agency workload', weight: 0.14 },
  { feature: 'complaint_type', label: 'Complaint type', weight: 0.12 },
  { feature: 'month', label: 'Month / seasonality', weight: 0.08 },
  { feature: 'borough', label: 'Borough effect', weight: 0.06 },
  { feature: 'agency', label: 'Agency effect', weight: 0.05 },
  { feature: 'open_data_channel_type', label: 'Submission channel', weight: 0.05 },
];

const SHAP_SIGN_PATTERN = [1, 1, 1, 1, 1, -1, -1, 1];

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

function hashString(str) {
  const value = String(str ?? '');
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function complaintHoursBoost(complaintType) {
  const type = String(complaintType ?? '');
  if (type.includes('HEAT')) return 24;
  if (type.includes('Sewer') || type.includes('Water')) return 14;
  if (type.includes('Street Condition')) return 10;
  if (type.includes('Noise') || type.includes('Parking')) return -4;
  return 2;
}

function boroughHoursBoost(borough) {
  const boosts = {
    Bronx: 12,
    Brooklyn: 6,
    Queens: 4,
    Manhattan: -2,
    'Staten Island': -4,
  };
  return boosts[borough] ?? 0;
}

function buildAgencyFeatureStats(agency, complaintType, borough, zip, dayOfWeek, month, rng) {
  const agencyBase = AGENCY_BASE_HOURS[agency] ?? 40;
  const zipSeed = (hashString(`${agency}-${zip}`) % 17) - 8;
  const dowSeed = [6, 4, 2, 0, -1, 8, 10][dayOfWeek] ?? 0;
  const monthSeed = month <= 2 || month === 12 ? 8 : month >= 6 && month <= 8 ? -3 : 2;
  const complaintBoost = complaintHoursBoost(complaintType);
  const boroughBoost = boroughHoursBoost(borough);

  const agencyMedian = agencyBase + boroughBoost * 0.25;
  const agencyComplaintMedian = agencyMedian + complaintBoost;
  const complaintMedian = complaintBoost + agencyBase * 0.35;
  const agencyZipMedian = agencyMedian + zipSeed * 0.6;
  const agencyDowMedian = agencyMedian + dowSeed;
  const boroughComplaintMedian = agencyComplaintMedian + boroughBoost * 0.4;

  return {
    agency_workload_24h: round(randomFloat(rng, 12, 180) + agencyBase * 0.15, 1),
    agency_median_hours: round(agencyMedian + randomFloat(rng, -2, 2), 1),
    agency_volume: randomInt(rng, 420, 14800),
    agency_complaint_median: round(agencyComplaintMedian + randomFloat(rng, -1.5, 1.5), 1),
    complaint_median_hours: round(complaintMedian + randomFloat(rng, -1, 1), 1),
    agency_zip_median: round(agencyZipMedian + randomFloat(rng, -1, 1), 1),
    agency_dow_median: round(agencyDowMedian + randomFloat(rng, -0.8, 0.8), 1),
    borough_complaint_median: round(boroughComplaintMedian + randomFloat(rng, -1.2, 1.2), 1),
    _monthSeasonality: monthSeed,
  };
}

function buildModelFeatures(record, stats) {
  return {
    complaint_type: record.complaint_type ?? '',
    agency: record.agency ?? '',
    borough: record.borough ?? '',
    incident_zip: record.incident_zip ?? '',
    open_data_channel_type: record.open_data_channel_type ?? 'UNKNOWN',
    day_of_week: Number.isFinite(Number(record.day_of_week)) ? Number(record.day_of_week) : 0,
    month: Number.isFinite(Number(record.month)) ? Number(record.month) : 1,
    agency_workload_24h: stats.agency_workload_24h ?? 0,
    agency_median_hours: stats.agency_median_hours ?? 0,
    agency_volume: stats.agency_volume ?? 0,
    agency_complaint_median: stats.agency_complaint_median ?? 0,
    complaint_median_hours: stats.complaint_median_hours ?? 0,
    agency_zip_median: stats.agency_zip_median ?? 0,
    agency_dow_median: stats.agency_dow_median ?? 0,
    borough_complaint_median: stats.borough_complaint_median ?? 0,
  };
}

function buildShapFactorsFromDelta(delta, rng, { highDelayBias = false } = {}) {
  const safeDelta = Number(delta) || 0;
  const factors = SHAP_FACTOR_DEFS.map((def, index) => {
    let sign = SHAP_SIGN_PATTERN[index];
    if (highDelayBias && sign < 0 && safeDelta > 48) {
      sign = rng() < 0.35 ? 1 : sign;
    }
    const shap = round(safeDelta * def.weight * sign * (0.82 + rng() * 0.36), 2);
    return {
      feature: def.feature,
      label: def.label,
      shap_value: shap,
      direction: shap >= 0 ? 'increases' : 'decreases',
    };
  });

  const sum = factors.reduce((total, row) => total + row.shap_value, 0);
  const correction = round(safeDelta - sum, 2);
  factors[0] = {
    ...factors[0],
    shap_value: round(factors[0].shap_value + correction, 2),
    direction: factors[0].shap_value + correction >= 0 ? 'increases' : 'decreases',
  };

  return factors.sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
}

function buildShapExplanation(predictedHours, rng, options = {}) {
  const prediction = round(Math.max(0, Number(predictedHours) || 0), 1);
  const baseline = round(
    options.baseline_value ?? prediction * randomFloat(rng, 0.4, 0.52),
    1,
  );
  const factors =
    options.factors ??
    buildShapFactorsFromDelta(prediction - baseline, rng, {
      highDelayBias: prediction >= 72,
    });

  return {
    baseline_value: baseline,
    prediction_value: prediction,
    factors,
  };
}

function attachMlFields(record, rng, overrides = {}) {
  const predicted = round(
    overrides.predicted_response_hours ?? record.predicted_response_hours ?? 24,
    1,
  );
  const stats = buildAgencyFeatureStats(
    record.agency,
    record.complaint_type,
    record.borough,
    record.incident_zip,
    record.day_of_week,
    record.month,
    rng,
  );

  const shap_explanation = buildShapExplanation(predicted, rng, {
    baseline_value: overrides.shap_baseline,
    factors: overrides.shap_factors,
  });

  const prediction_confidence = round(
    Math.min(
      0.97,
      Math.max(
        0.62,
        0.9 -
          Math.abs(predicted - (record.response_hours ?? predicted)) / 220 +
          (overrides.confidenceBoost ?? 0),
      ),
    ),
    2,
  );

  return {
    ...record,
    predicted_response_hours: predicted,
    predicted_delay_bucket: getPredictedDelayBucket(predicted),
    prediction_risk_level: getPredictionRiskLevel(predicted),
    model_features: buildModelFeatures(record, stats),
    shap_explanation,
    prediction_confidence,
    delay_tier:
      predicted < 24 ? 'low' : predicted < 72 ? 'medium' : 'high',
    model_version: 'civic-lens-mock-v0.4',
  };
}

function createRng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted(rng, items, weightKey = 'weight') {
  const total = items.reduce((sum, item) => sum + (item[weightKey] ?? item), 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= item[weightKey] ?? item;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomFloat(rng, min, max) {
  return min + rng() * (max - min);
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function getSeason(month) {
  if (month <= 2 || month === 12) return 'Winter';
  if (month <= 5) return 'Spring';
  if (month <= 8) return 'Summer';
  return 'Fall';
}

function isHoliday(month, day) {
  const holidays = new Set(['01-01', '07-04', '12-25', '11-28', '09-02', '01-15', '02-19']);
  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return holidays.has(key) ? 1 : 0;
}

function generateObjectId(index) {
  const hex = index.toString(16).padStart(6, '0');
  return `6a1478cb04d2bc${hex}${String((index * 7919) % 999999).padStart(6, '0')}`.slice(0, 24);
}

function buildProfile(rng) {
  const roll = rng();
  if (roll < 0.08) return 'highRisk';
  if (roll < 0.18) return 'highDelay';
  if (roll < 0.3) return 'unresolved';
  return 'normal';
}

function generateRecord(index, rng) {
  const boroughName = pickWeighted(
    rng,
    BOROUGHS.map((name) => ({ name, weight: BOROUGH_CONFIG[name].weight })),
  ).name;
  const borough = BOROUGH_CONFIG[boroughName];
  const complaint = pickWeighted(rng, COMPLAINT_CATALOG);
  let status = 'Closed';
  const profile = buildProfile(rng);

  if (profile === 'unresolved') {
    status = pickWeighted(rng, [
      { value: 'Open', weight: 0.45 },
      { value: 'In Progress', weight: 0.4 },
      { value: 'Pending', weight: 0.15 },
    ]).value;
  } else if (profile === 'highDelay' || profile === 'highRisk') {
    status = 'Closed';
  } else {
    status = pickWeighted(rng, [
      { value: 'Closed', weight: 0.9 },
      { value: 'In Progress', weight: 0.06 },
      { value: 'Open', weight: 0.03 },
      { value: 'Pending', weight: 0.01 },
    ]).value;
  }

  const year = rng() < 0.25 ? 2023 : 2024;
  const month = randomInt(rng, 1, 12);
  const day = randomInt(rng, 1, 28);
  const hour = randomInt(rng, 0, 23);
  const minute = randomInt(rng, 0, 59);
  const second = randomInt(rng, 0, 59);
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const season = getSeason(month);

  let responseHours;
  if (profile === 'highDelay') {
    responseHours = randomFloat(rng, 120, 480);
  } else if (profile === 'unresolved' || status === 'Open' || status === 'Pending') {
    responseHours = randomFloat(rng, 72, 720);
  } else if (status === 'In Progress') {
    responseHours = randomFloat(rng, 24, 240);
  } else {
    responseHours = randomFloat(rng, 0.08, 72);
  }

  if (complaint.type === 'HEAT/HOT WATER' && (season === 'Winter' || season === 'Fall')) {
    responseHours *= randomFloat(rng, 0.6, 0.9);
  }

  const createdDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const isUnresolved = status === 'Open' || status === 'In Progress' || status === 'Pending' ? 1 : 0;
  const closedDate = isUnresolved
    ? null
    : new Date(createdDate.getTime() + responseHours * 3600000);

  let urgencyScore = complaint.baseUrgency + randomFloat(rng, -0.08, 0.12);
  if (complaint.seasonalBoost?.[season]) {
    urgencyScore += complaint.seasonalBoost[season];
  }
  if (profile === 'highRisk') urgencyScore = randomFloat(rng, 0.72, 0.98);
  urgencyScore = Math.min(1, Math.max(0, urgencyScore));

  let delayRiskScore = (responseHours / 168) * 0.45 + urgencyScore * 0.35 + randomFloat(rng, 0, 0.2);
  if (profile === 'highRisk') delayRiskScore = randomFloat(rng, 0.76, 0.97);
  if (profile === 'highDelay') delayRiskScore = randomFloat(rng, 0.55, 0.88);
  if (profile === 'unresolved') delayRiskScore = randomFloat(rng, 0.45, 0.92);
  delayRiskScore = Math.min(0.99, Math.max(0.05, delayRiskScore));

  const predictedResponseHours = isUnresolved
    ? round(responseHours * randomFloat(rng, 1.1, 1.8))
    : round(responseHours * randomFloat(rng, 0.75, 1.35), 1);

  const isVagueResolution = complaint.agency === 'NYPD' && rng() < 0.22
    ? 1
    : profile === 'unresolved' && rng() < 0.35
      ? 1
      : rng() < 0.1
        ? 1
        : 0;

  const resolutionPool = isUnresolved
    ? RESOLUTIONS.open
    : isVagueResolution
      ? RESOLUTIONS.vague
      : RESOLUTIONS.closed;

  const streetNumber = randomInt(rng, 12, 2800);
  const street = borough.streets[randomInt(rng, 0, borough.streets.length - 1)];

  const baseRecord = {
    _id: generateObjectId(index),
    unique_key: String(61000000 + index),
    created_date: createdDate.toISOString(),
    closed_date: closedDate ? closedDate.toISOString() : null,
    agency: complaint.agency,
    agency_name: AGENCIES[complaint.agency],
    complaint_type: complaint.type,
    descriptor: complaint.descriptors[randomInt(rng, 0, complaint.descriptors.length - 1)],
    status,
    resolution_description: resolutionPool[randomInt(rng, 0, resolutionPool.length - 1)],
    borough: boroughName,
    incident_zip: borough.zips[randomInt(rng, 0, borough.zips.length - 1)],
    incident_address: `${streetNumber} ${street}`,
    latitude: round(randomFloat(rng, borough.lat[0], borough.lat[1]), 8),
    longitude: round(randomFloat(rng, borough.lng[0], borough.lng[1]), 8),
    community_board: `${randomInt(rng, 1, 14)} ${borough.cbPrefix}`,
    open_data_channel_type: CHANNELS[randomInt(rng, 0, CHANNELS.length - 1)],
    response_hours: round(responseHours, 4),
    is_unresolved: isUnresolved,
    year,
    month,
    day_of_week: dayOfWeek,
    hour,
    is_weekend: dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0,
    is_holiday: isHoliday(month, day),
    season,
    urgency_score: round(urgencyScore),
    is_vague_resolution: isVagueResolution,
    predicted_response_hours: predictedResponseHours,
    delay_risk_score: round(delayRiskScore),
  };

  return attachMlFields(baseRecord, rng);
}

const CANONICAL_BASE = {
  _id: '6a1478cb04d2bca97edf6218',
  unique_key: '61534754',
  created_date: '2024-06-19T07:42:29.000Z',
  closed_date: '2024-06-19T07:54:57.000Z',
  agency: 'NYPD',
  agency_name: 'New York City Police Department',
  complaint_type: 'Noise - Street/Sidewalk',
  descriptor: 'Loud Talking',
  status: 'Closed',
  resolution_description: 'The Police Department reviewed your complaint and provided additional information below.',
  borough: 'Manhattan',
  incident_zip: '10026',
  incident_address: '1925 7 AVENUE',
  latitude: 40.80343327648867,
  longitude: -73.95236059020847,
  community_board: '10 MANHATTAN',
  open_data_channel_type: 'ONLINE',
  response_hours: 0.20777777777777778,
  is_unresolved: 0,
  year: 2024,
  month: 6,
  day_of_week: 2,
  hour: 7,
  is_weekend: 0,
  is_holiday: 1,
  season: 'Summer',
  urgency_score: 0,
  is_vague_resolution: 0,
  predicted_response_hours: 1.4,
  delay_risk_score: 0.22,
};

function scaleShapTemplate(deltaHours) {
  const templateSum = 1.68;
  const scale = deltaHours / templateSum;
  const raw = [0.82, 0.41, 0.23, 0.18, 0.1, -0.05, -0.02, 0.01];
  return SHAP_FACTOR_DEFS.map((def, index) => {
    const shap = round(raw[index] * scale, 2);
    return {
      feature: def.feature,
      label: def.label,
      shap_value: shap,
      direction: shap >= 0 ? 'increases' : 'decreases',
    };
  });
}

function buildShowcaseRecords() {
  const rng = createRng(9001);

  const showcase85Base = {
    _id: '6a1478cb04d2bc001demo85',
    unique_key: '61999001',
    created_date: '2024-01-14T09:15:00.000Z',
    closed_date: null,
    agency: 'HPD',
    agency_name: AGENCIES.HPD,
    complaint_type: 'HEAT/HOT WATER',
    descriptor: 'No Heat',
    status: 'In Progress',
    resolution_description: 'Inspection scheduled; awaiting agency response.',
    borough: 'Bronx',
    incident_zip: '10457',
    incident_address: '842 GRAND CONCOURSE',
    latitude: 40.84612,
    longitude: -73.91104,
    community_board: '4 BRONX',
    open_data_channel_type: 'PHONE',
    response_hours: 92.4,
    is_unresolved: 1,
    year: 2024,
    month: 1,
    day_of_week: 0,
    hour: 9,
    is_weekend: 1,
    is_holiday: 0,
    season: 'Winter',
    urgency_score: 0.91,
    is_vague_resolution: 0,
    predicted_response_hours: 85,
    delay_risk_score: 0.78,
  };

  const showcase58Base = {
    _id: '6a1478cb04d2bc002demo58',
    unique_key: '61999002',
    created_date: '2024-03-22T16:40:00.000Z',
    closed_date: null,
    agency: 'DEP',
    agency_name: AGENCIES.DEP,
    complaint_type: 'Water Leak',
    descriptor: 'Heavy Flow',
    status: 'Open',
    resolution_description: 'Request is pending assignment to a field unit.',
    borough: 'Brooklyn',
    incident_zip: '11217',
    incident_address: '455 ATLANTIC AVENUE',
    latitude: 40.68491,
    longitude: -73.97762,
    community_board: '6 BROOKLYN',
    open_data_channel_type: 'MOBILE',
    response_hours: 61.2,
    is_unresolved: 1,
    year: 2024,
    month: 3,
    day_of_week: 5,
    hour: 16,
    is_weekend: 0,
    is_holiday: 0,
    season: 'Spring',
    urgency_score: 0.74,
    is_vague_resolution: 0,
    predicted_response_hours: 58,
    delay_risk_score: 0.61,
  };

  const showcase12Base = {
    _id: '6a1478cb04d2bc003demo12',
    unique_key: '61999003',
    created_date: '2024-06-19T07:42:29.000Z',
    closed_date: '2024-06-19T19:42:29.000Z',
    agency: 'NYPD',
    agency_name: AGENCIES.NYPD,
    complaint_type: 'Noise - Street/Sidewalk',
    descriptor: 'Loud Music',
    status: 'Closed',
    resolution_description: 'The Police Department reviewed your complaint and provided additional information below.',
    borough: 'Manhattan',
    incident_zip: '10003',
    incident_address: '88 2 AVENUE',
    latitude: 40.72651,
    longitude: -73.98821,
    community_board: '3 MANHATTAN',
    open_data_channel_type: 'ONLINE',
    response_hours: 11.6,
    is_unresolved: 0,
    year: 2024,
    month: 6,
    day_of_week: 3,
    hour: 7,
    is_weekend: 0,
    is_holiday: 0,
    season: 'Summer',
    urgency_score: 0.18,
    is_vague_resolution: 0,
    predicted_response_hours: 12,
    delay_risk_score: 0.19,
  };

  const shap85 = scaleShapTemplate(43.7);
  const shap58 = [
    { feature: 'agency_complaint_median', label: 'Agency + complaint historical delay', shap_value: 14.1, direction: 'increases' },
    { feature: 'agency_zip_median', label: 'Agency + ZIP historical delay', shap_value: 5.2, direction: 'increases' },
    { feature: 'agency_workload_24h', label: 'Recent agency workload', shap_value: 3.4, direction: 'increases' },
    { feature: 'complaint_type', label: 'Complaint type', shap_value: 2.9, direction: 'increases' },
    { feature: 'month', label: 'Month / seasonality', shap_value: 1.6, direction: 'increases' },
    { feature: 'borough', label: 'Borough effect', shap_value: -1.1, direction: 'decreases' },
    { feature: 'agency', label: 'Agency effect', shap_value: -0.6, direction: 'decreases' },
    { feature: 'open_data_channel_type', label: 'Submission channel', shap_value: 0.4, direction: 'increases' },
  ];
  const shap12 = [
    { feature: 'borough', label: 'Borough effect', shap_value: -1.4, direction: 'decreases' },
    { feature: 'agency', label: 'Agency effect', shap_value: -0.9, direction: 'decreases' },
    { feature: 'open_data_channel_type', label: 'Submission channel', shap_value: 0.5, direction: 'increases' },
    { feature: 'complaint_type', label: 'Complaint type', shap_value: 0.7, direction: 'increases' },
    { feature: 'month', label: 'Month / seasonality', shap_value: 0.4, direction: 'increases' },
    { feature: 'agency_zip_median', label: 'Agency + ZIP historical delay', shap_value: 0.6, direction: 'increases' },
    { feature: 'agency_workload_24h', label: 'Recent agency workload', shap_value: 0.3, direction: 'increases' },
    { feature: 'agency_complaint_median', label: 'Agency + complaint historical delay', shap_value: 2.6, direction: 'increases' },
  ];

  return [
    attachMlFields(showcase85Base, rng, {
      predicted_response_hours: 85,
      shap_baseline: 41.3,
      shap_factors: shap85,
      confidenceBoost: 0.04,
    }),
    attachMlFields(showcase58Base, rng, {
      predicted_response_hours: 58,
      shap_baseline: 32.1,
      shap_factors: shap58,
      confidenceBoost: 0.03,
    }),
    attachMlFields(showcase12Base, rng, {
      predicted_response_hours: 12,
      shap_baseline: 9.2,
      shap_factors: shap12,
      confidenceBoost: 0.06,
    }),
  ];
}

function buildMockRequests(count = 800) {
  const rng = createRng(20260326);
  const showcases = buildShowcaseRecords();
  const canonical = attachMlFields(CANONICAL_BASE, createRng(42), {
    predicted_response_hours: 12,
    shap_baseline: 9.4,
    shap_factors: scaleShapTemplate(2.6),
    confidenceBoost: 0.05,
  });
  const generated = Array.from({ length: count - 1 - showcases.length }, (_, i) =>
    generateRecord(i + 100, rng),
  );
  return [...showcases, canonical, ...generated];
}

export const mockRequests = buildMockRequests(800);

export const filterOptions = {
  boroughs: ['All', ...BOROUGHS],
  statuses: ['All', 'Closed', 'Open', 'In Progress', 'Pending'],
  seasons: ['All', 'Winter', 'Spring', 'Summer', 'Fall'],
  agencies: ['All', ...Object.keys(AGENCIES)],
  complaintTypes: ['All', ...COMPLAINT_CATALOG.map((c) => c.type)],
};

export { BOROUGHS, AGENCIES, COMPLAINT_CATALOG as COMPLAINT_TYPES };

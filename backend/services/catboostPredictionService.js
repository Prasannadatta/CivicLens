import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { enrichRecordHeuristic } from './delayPredictionService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ML_DIR = path.join(__dirname, '../ml');
const PREDICT_SCRIPT = path.join(ML_DIR, 'predict_batch.py');
const DEFAULT_MODEL_PATH = path.join(ML_DIR, 'catboost_model.pkl');
const FALLBACK_MODEL_PATH = path.resolve(
  ML_DIR,
  '../../../../Project/models/catboost/catboost_model.pkl',
);

const PYTHON = process.env.PYTHON_PATH || 'python3';

function resolveModelPath() {
  if (process.env.CATBOOST_MODEL_PATH) {
    return process.env.CATBOOST_MODEL_PATH;
  }
  if (fs.existsSync(DEFAULT_MODEL_PATH)) {
    return DEFAULT_MODEL_PATH;
  }
  return FALLBACK_MODEL_PATH;
}

const MODEL_PATH = resolveModelPath();
const BATCH_SIZE = Number(process.env.PREDICT_BATCH_SIZE || 200);
const CACHE_TTL_MS = Number(process.env.PREDICT_CACHE_TTL_MS || 15 * 60 * 1000);

let pythonAvailable = null;
const predictionCache = new Map();

function recordCacheKey(record) {
  return String(record?.unique_key ?? record?._id ?? '');
}

function getCachedPrediction(key) {
  if (!key) return null;
  const entry = predictionCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    predictionCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedPrediction(key, data) {
  if (!key) return;
  predictionCache.set(key, { ts: Date.now(), data });
}

function needsPrediction(record) {
  const cached = getCachedPrediction(recordCacheKey(record));
  if (cached?.model_version === 'catboost-v1') return false;

  const hours = Number(record?.predicted_response_hours);
  return !Number.isFinite(hours) || hours <= 0 || record?.model_version !== 'catboost-v1';
}

export function getPredictionModelPath() {
  return MODEL_PATH;
}

async function runPythonBatch(records) {
  const payload = JSON.stringify({ records, modelPath: MODEL_PATH });

  return new Promise((resolve, reject) => {
    const proc = spawn(PYTHON, [PREDICT_SCRIPT], {
      cwd: ML_DIR,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, CATBOOST_MODEL_PATH: MODEL_PATH },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => { stdout += chunk; });
    proc.stderr.on('data', (chunk) => { stderr += chunk; });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Python predictor exited with code ${code}`));
        return;
      }
      try {
        const parsed = JSON.parse(stdout);
        if (!parsed.ok) {
          reject(new Error(parsed.error || 'CatBoost prediction failed'));
          return;
        }
        resolve(parsed.records || []);
      } catch (err) {
        reject(new Error(`Invalid predictor output: ${err.message}`));
      }
    });

    proc.stdin.write(payload);
    proc.stdin.end();
  });
}

async function predictBatchWithCatBoost(records) {
  if (!records.length) return [];

  const chunks = [];
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    chunks.push(records.slice(i, i + BATCH_SIZE));
  }

  const results = [];
  for (const chunk of chunks) {
    // eslint-disable-next-line no-await-in-loop
    const enriched = await runPythonBatch(chunk);
    results.push(...enriched);
  }
  return results;
}

export async function isCatBoostAvailable() {
  if (pythonAvailable != null) return pythonAvailable;
  try {
    await predictBatchWithCatBoost([
      {
        complaint_type: 'Noise - Street/Sidewalk',
        agency: 'NYPD',
        borough: 'Manhattan',
        incident_zip: '10001',
        day_of_week: 1,
        month: 6,
        hour: 12,
        season: 'Summer',
        urgency_score: 0.2,
      },
    ]);
    pythonAvailable = true;
  } catch {
    pythonAvailable = false;
  }
  return pythonAvailable;
}

export async function enrichRequestsWithPredictions(records, { force = false } = {}) {
  const list = Array.isArray(records) ? records : [];
  if (!list.length) return [];

  const toPredict = force
    ? list
    : list.filter(needsPrediction);

  if (!toPredict.length) {
    return list.map((record) => {
      const cached = getCachedPrediction(recordCacheKey(record));
      if (cached) return { ...record, ...cached };
      return {
        ...record,
        agency_workload_24h:
          record.agency_workload_24h
          ?? record.model_features?.agency_workload_24h
          ?? undefined,
      };
    });
  }

  try {
    const enrichedByKey = new Map();
    const predicted = await predictBatchWithCatBoost(toPredict);
    predicted.forEach((record, index) => {
      const source = toPredict[index];
      const key = recordCacheKey(source) || String(index);
      setCachedPrediction(key, record);
      enrichedByKey.set(key, record);
    });

    return list.map((record) => {
      const key = recordCacheKey(record);
      const cached = getCachedPrediction(key);
      if (cached) return { ...record, ...cached };
      return enrichedByKey.get(key) ?? {
        ...record,
        ...enrichRecordHeuristic(record),
      };
    });
  } catch (err) {
    console.warn('CatBoost enrichment failed, using heuristic fallback:', err.message);
    return list.map((record) => (
      needsPrediction(record)
        ? { ...record, ...enrichRecordHeuristic(record) }
        : record
    ));
  }
}

export async function predictRequests(records) {
  return enrichRequestsWithPredictions(records, { force: true });
}

import express from 'express';
import {
  getPredictionModelPath,
  isCatBoostAvailable,
  predictRequests,
} from '../services/catboostPredictionService.js';

const router = express.Router();

router.get('/status', async (_req, res) => {
  try {
    const available = await isCatBoostAvailable();
    res.json({
      ok: true,
      engine: available ? 'catboost' : 'heuristic-fallback',
      modelPath: getPredictionModelPath(),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

router.post('/', async (req, res) => {
  try {
    const records = Array.isArray(req.body) ? req.body : req.body.records ?? [];
    if (!records.length) return res.status(400).json({ error: 'No records provided' });
    const enriched = await predictRequests(records);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;

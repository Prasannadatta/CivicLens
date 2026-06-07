import { Router } from 'express';
import {
  getDashboardBundle,
  getMapBundle,
  getDashboardStats,
  getMapPoints,
  getBoroughBurden,
  getComplaintDrivers,
  getDelayTrend,
} from '../controllers/statsController.js';
import { getCascadingFacets } from '../controllers/facetController.js';

const router = Router();

router.get('/facets', getCascadingFacets);
router.get('/dashboard', getDashboardBundle);
router.get('/map-bundle', getMapBundle);
router.get('/stats', getDashboardStats);
router.get('/map-points', getMapPoints);
router.get('/borough-burden', getBoroughBurden);
router.get('/complaint-drivers', getComplaintDrivers);
router.get('/delay-trend', getDelayTrend);

export default router;

import express from 'express';
import {
  getAllRequests,
  getRequestById,
  getRequestStats,
  getRequestFacets,
  createRequest,
  updateRequest,
  deleteRequest,
  bulkImport,
} from '../controllers/requestController.js';

const router = express.Router();

router.get('/', getAllRequests);
router.get('/stats', getRequestStats);
router.get('/facets', getRequestFacets);
router.get('/:id', getRequestById);
router.post('/', createRequest);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);

// bulk import
router.post('/import/bulk', bulkImport);

export default router;

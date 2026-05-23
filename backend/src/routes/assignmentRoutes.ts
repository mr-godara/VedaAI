import { Router } from 'express';
import {
  createAssignment,
  getAssignments,
  getAssignment,
  getResult,
  regenerateAssignment,
  downloadPdf,
  deleteAssignment
} from '../controllers/assignmentController';
import { validate } from '../middleware/validation';
import { AssignmentInputSchema } from '../types';

const router = Router();

router.post('/', validate(AssignmentInputSchema), createAssignment);
router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.get('/:id/result', getResult);
router.post('/:id/regenerate', regenerateAssignment);
router.get('/:id/pdf', downloadPdf);
router.delete('/:id', deleteAssignment);

export default router;

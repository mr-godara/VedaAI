import { Router } from 'express';
import { uploadFile } from '../controllers/uploadController';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/upload', upload.single('file'), uploadFile);

export default router;

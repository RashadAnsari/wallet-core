import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.status(204).end();
});

export default router;

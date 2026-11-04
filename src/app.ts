import express, { Request, Response } from 'express';
import { SessionStore } from './sessions';

export function createApp(store: SessionStore = new SessionStore()) {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.get('/sessions', (_req: Request, res: Response) => {
    res.json(store.list());
  });

  app.post('/sessions', (req: Request, res: Response) => {
    try {
      res.status(201).json(store.start(req.body ?? {}));
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  app.post('/sessions/:id/stop', (req: Request, res: Response) => {
    try {
      const energy = Number(req.body?.energyKwh);
      if (!Number.isFinite(energy) || energy < 0) {
        res.status(400).json({ error: 'energyKwh must be a non-negative number' });
        return;
      }
      res.json(store.stop(String(req.params.id), energy));
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  });

  app.get('/reports/energy-by-station', (_req: Request, res: Response) => {
    res.json(store.energyByStation());
  });

  return app;
}

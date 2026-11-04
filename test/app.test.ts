import request from 'supertest';
import { createApp } from '../src/app';

describe('HTTP API', () => {
  it('reports health', async () => {
    const res = await request(createApp()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('creates, stops and lists a session', async () => {
    const app = createApp();
    const created = await request(app).post('/sessions').send({ stationId: 'ST-09', vehicleId: 'VH-9' });
    expect(created.status).toBe(201);
    const stopped = await request(app).post(`/sessions/${created.body.id}/stop`).send({ energyKwh: 22.5 });
    expect(stopped.status).toBe(200);
    expect(stopped.body.status).toBe('completed');
    const list = await request(app).get('/sessions');
    expect(list.body).toHaveLength(1);
  });

  it('validates input', async () => {
    const app = createApp();
    const bad = await request(app).post('/sessions').send({ stationId: 'ST-09' });
    expect(bad.status).toBe(400);
    const badStop = await request(app).post('/sessions/CS-0001/stop').send({ energyKwh: -1 });
    expect(badStop.status).toBe(400);
  });
});

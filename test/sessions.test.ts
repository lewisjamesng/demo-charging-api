import { SessionStore } from '../src/sessions';

describe('SessionStore', () => {
  it('starts and stops a session, rounding energy', () => {
    const store = new SessionStore();
    const s = store.start({ stationId: 'ST-01', vehicleId: 'VH-100' }, new Date('2026-01-01T10:00:00Z'));
    expect(s.id).toBe('CS-0001');
    const done = store.stop(s.id, 12.3456, new Date('2026-01-01T11:00:00Z'));
    expect(done.status).toBe('completed');
    expect(done.energyKwh).toBe(12.35);
  });

  it('rejects a second active session on the same station', () => {
    const store = new SessionStore();
    store.start({ stationId: 'ST-01', vehicleId: 'VH-100' });
    expect(() => store.start({ stationId: 'ST-01', vehicleId: 'VH-200' })).toThrow(/already has an active session/);
  });

  it('aggregates delivered energy by station', () => {
    const store = new SessionStore();
    const a = store.start({ stationId: 'ST-01', vehicleId: 'VH-1' });
    store.stop(a.id, 10.111);
    const b = store.start({ stationId: 'ST-01', vehicleId: 'VH-2' });
    store.stop(b.id, 5.222);
    const c = store.start({ stationId: 'ST-02', vehicleId: 'VH-3' });
    store.stop(c.id, 7);
    store.start({ stationId: 'ST-03', vehicleId: 'VH-4' });
    expect(store.energyByStation()).toEqual({ 'ST-01': 15.33, 'ST-02': 7 });
  });
});

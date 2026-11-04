import _ from 'lodash';

export type SessionStatus = 'active' | 'completed';

export interface ChargingSession {
  id: string;
  stationId: string;
  vehicleId: string;
  startedAt: string;
  endedAt?: string;
  energyKwh: number;
  status: SessionStatus;
}

export interface StartSessionInput {
  stationId: string;
  vehicleId: string;
}

/** In-memory store of charging sessions. All data is synthetic. */
export class SessionStore {
  private sessions: ChargingSession[] = [];
  private nextId = 1;

  start(input: StartSessionInput, now: Date = new Date()): ChargingSession {
    if (!input.stationId || !input.vehicleId) {
      throw new Error('stationId and vehicleId are required');
    }
    const busy = _.find(this.sessions, { stationId: input.stationId, status: 'active' });
    if (busy) {
      throw new Error(`station ${input.stationId} already has an active session`);
    }
    const session: ChargingSession = {
      id: `CS-${String(this.nextId++).padStart(4, '0')}`,
      stationId: input.stationId,
      vehicleId: input.vehicleId,
      startedAt: now.toISOString(),
      energyKwh: 0,
      status: 'active',
    };
    this.sessions.push(session);
    return _.cloneDeep(session);
  }

  stop(id: string, energyKwh: number, now: Date = new Date()): ChargingSession {
    const session = _.find(this.sessions, { id });
    if (!session) {
      throw new Error(`session ${id} not found`);
    }
    if (session.status !== 'active') {
      throw new Error(`session ${id} is not active`);
    }
    session.energyKwh = _.round(energyKwh, 2);
    session.endedAt = now.toISOString();
    session.status = 'completed';
    return _.cloneDeep(session);
  }

  list(): ChargingSession[] {
    return _.orderBy(_.cloneDeep(this.sessions), ['startedAt', 'id'], ['desc', 'desc']);
  }

  /** Total delivered energy per station, rounded to 2 decimals. */
  energyByStation(): Record<string, number> {
    const grouped = _.groupBy(
      this.sessions.filter((s) => s.status === 'completed'),
      'stationId',
    );
    return _.mapValues(grouped, (rows) => _.round(_.sumBy(rows, 'energyKwh'), 2));
  }
}

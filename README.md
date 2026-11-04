# demo-charging-api

Small REST API for EV charging sessions. **Synthetic demo repository.** All code and data are fictional sample material for a security-remediation demo.

**Owner:** `@demo-org/charging-platform-team` (see `.github/CODEOWNERS`)

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/sessions` | List sessions, newest first |
| POST | `/sessions` | Start a session `{ stationId, vehicleId }` |
| POST | `/sessions/:id/stop` | Stop a session `{ energyKwh }` |
| GET | `/reports/energy-by-station` | Delivered kWh per station |

## Develop

```bash
npm ci
npm run build
npm test
```

## Security scanning

CI runs `npm audit --omit=dev` and `osv-scanner` in the `security-scan` job. Reports are uploaded as artifacts, and the SARIF goes to GitHub code scanning. `osv-scanner.toml` ignores only dev-only Jest tooling. Runtime dependencies are never ignored.

## Licence

MIT

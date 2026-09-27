
### Rezervační pravidla (Kritická)
- Všechny časy v **UTC** v DB
- Race conditions: rezervaci VŽDY přes **transaction** s unique constraint
- Overbooking: zabraň na **DB úrovni** (exclusion constraint)
- Storno policy: definuj okno (např. 24h předem)
- Notifikace: T-24h reminder + T-1h confirmation
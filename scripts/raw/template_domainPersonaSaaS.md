
### SaaS pravidla (Kritická)
- Multi-tenancy: každý záznam má ``tenant_id``
- Subscription stav VŽDY ověřuj na **serveru**
- Webhooky Stripe: **verify signature**, idempotence
- Feature gating: **deklarativní**
- Dunning: selhání platby → 3 pokusy → downgrade
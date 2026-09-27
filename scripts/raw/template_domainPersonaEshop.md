
### E-commerce pravidla (Kritická)
- Ceny VŽDY v minor units (haléře) jako ``integer``, nikdy ``float``
- Skladové množství ověřuj **atomicky** (SELECT FOR UPDATE nebo optimistic locking)
- Order je **immutable** po zaplacení
- Webhooky platebních bran MUSÍ být **idempotentní**
- Doprava a DPH se počítají **VŽDY na serveru**
- GDPR: ukládej pouze nezbytné údaje
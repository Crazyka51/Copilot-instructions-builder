# Databázová konfigurace: $($projName)

## Vybraná strategie
**$($vals.DbStrategy)**

## Integrace s Vercel
**$($vals.VercelDb)**

## Connection Pooling
**$($vals.Pooling)**

## Cache
**$($vals.Cache)**

## Klíčová pravidla

### Neon
- Driver: ``@neondatabase/serverless`` v HTTP režimu
- Preview branches automaticky pro každý PR
- Migrace: ``drizzle-kit push`` nebo ``prisma migrate deploy``
- Production: pooled URL s ``-pooler`` sufixem

### Supabase
- Connection: **Supavisor** transaction mode
- Direct connection POUZE pro migrace
- RLS: povinné pro všechny tabulky
- Auth: ``@supabase/ssr`` pro Next.js

### Dual-stack
- Preview: Neon branches
- Produkce: Supabase
- **Nikdy nesynchronizuj data mezi Neon a Supabase**

## Zakázané vzory
- ❌ Přímé ``new Pool()`` v serverless funkci
- ❌ Dlouhotrvající transakce přes více requestů
- ❌ Raw SQL bez prepared statements
- ❌ Secrets v kódu
- ❌ Migrace z pooled připojení
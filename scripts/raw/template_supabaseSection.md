
### Supabase konfigurace (all-in-one BaaS)
- Používej **Supavisor connection pooler** (transaction mode) pro serverless funkce
- Direct connection používej POUZE pro migrace
- Row Level Security (RLS) je povinná pro všechny tabulky s uživatelskými daty
- Auth: používej Supabase Auth s vlastními claims pro RBAC
- Storage: použij Supabase Storage pro soubory (alternativa k Vercel Blob)
- Realtime: Supabase Realtime pro live updates (Postgres changes)
- **Neprováděj dual-write stejných dat do Neon i Supabase**
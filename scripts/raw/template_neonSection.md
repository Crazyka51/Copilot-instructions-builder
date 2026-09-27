
### Neon konfigurace (serverless Postgres)
- Používej **@neondatabase/serverless** driver v HTTP režimu (žádný connection pool)
- V serverless funkcích používej ``neon()`` z ``@neondatabase/serverless``
- Databázové větve (branches) se vytvářejí automaticky pro každý Preview Deployment
- Pro migrace použij ``drizzle-kit`` nebo ``prisma migrate`` s přímým (ne-pooled) připojením
- V produkci použij pooled connection string (``-pooler`` sufix)
- Scale-to-zero: neaktivní větve se po 5 minutách pozastaví
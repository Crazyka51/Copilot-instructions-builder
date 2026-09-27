
### Vercel konfigurace
- Používej ``vercel.json`` pro rewrite rules a environment-specific nastavení
- Preview Deployments: automaticky pro každý PR (integrace s Neon branching)
- Edge Functions: pro geograficky distribuované API endpointy
- Blob Storage: pro uživatelské soubory (alternativa k S3)
- Analytics + Speed Insights: povinné pro monitoring produkce
- **Cron Jobs:** pro plánované úlohy (cleanup, e-maily, reporty)
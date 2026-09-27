// AUTOGENEROVÁNO skriptem scripts/to-ts.mjs - needituj ručně.
// Zdroj: CopilotBuilderPro2.ps1 (here-stringy převedené na TS šablony).
/* eslint-disable */
import type { GenCtx } from './types'

/** template_instrukce.md */
export const instrukceTpl = (c: GenCtx): string => `# Architektonická specifikace: ${c.p}

Jsi v kontextu moderního, enterprise-ready projektu. Následující direktivy definují strukturu a nástroje, které **MUSÍŠ** při generování dodržovat.

## 1. Základní Architektura
* **Repozitář:** ${c.v.Arch}
* **Typ architektury:** ${c.v.ArchType}
* **Rendering strategie:** ${c.v.Render}
* **Cílové platformy:** ${c.v.Target}
* **Cílové nasazení:** ${c.v.Deploy}
* **IaC:** ${c.v.Iac}

## 2. Správa obsahu, Meta dat a i18n
* **Strategie textového obsahu:** ${c.v.Cms}
* **CMS Editor:** ${c.v.CmsEditor}
* **Admin Shell:** ${c.v.AdminShell}
* **Správa Meta Tagů (SEO):** ${c.v.Seo}
* **Internacionalizace:** ${c.v.I18n}

**Kritické pravidlo pro UI:** UI komponenty nesmí obsahovat "hardcoded" texty. Veškerý textový obsah musí být načítán dynamicky.

## 3. Tech Stack
* **Frontend:** ${c.stackPair(c.v.Fe, c.v.Css)}
* **Design System & Vibe:** ${c.v.Design}
* **State Management:** ${c.v.State}
* **Formuláře a validace:** ${c.v.Forms}
* **Animace:** ${c.v.Animation}
* **Backend:** ${c.v.Be}
* **Databázová strategie:** ${c.v.DbStrategy}
* **Integrace s Vercel DB:** ${c.v.VercelDb}
* **ORM / Data Layer:** ${c.v.Orm}
* **Data Fetching:** ${c.v.Fetch}
* **Real-time komunikace:** ${c.v.Realtime}
* **Connection Pooling:** ${c.v.Pooling}
* **Cache strategie:** ${c.v.Cache}
* **API Design:** ${c.v.ApiDesign}

## 4. Kvalita, Bezpečnost a Observability
* **Standardy kódu:**
${c.lists.Lint}

* **Testování:**
${c.lists.Test}

* **Typ autentizace:** ${c.v.AuthType}
* **Autentizace & Role:**
${c.lists.Auth}

* **Bezpečnostní moduly:**
${c.lists.Sec}

* **Observability & Analytics:**
${c.lists.Observability}

* **Logování:**
${c.lists.Log}

* **Compliance:**
${c.lists.Compliance}

## 5. DevOps a CI/CD
* **CI/CD Pipeline:**
${c.lists.CiCd}

* **Vercel konfigurace:**
${c.lists.VercelFeatures}

## 6. Implementované Moduly
**Administrace:**
${c.lists.Admin}

**Byznys Funkce:**
${c.lists.Core}

**AI Moduly:**
${c.lists.Ai}

**A/B Testování:** ${c.v.AbTesting}

**Frontend UI utility:**
${c.lists.FeUi}
${c.neonSection}
${c.supabaseSection}
${c.vercelSection}
${c.tipTapSection}
${c.specializedSection}
${c.legalSection}`

/** template_persona.md */
export const personaTpl = (c: GenCtx): string => `# Persona: Lead Enterprise Architect & DevOps Engineer

V tomto repozitáři přebíráš roli zkušeného softwarového architekta.

## Zásadní Pravidla (Never Break These):

1. **Decoupling obsahu:** Veškerý textový obsah musí být odděleny od souborů s pohledy/logikou.

2. **Type Safety & Zod:** Typový systém je absolutně striktní. Žádné \`any\`.

3. **Zabezpečený Backend & Práva:** Zero-trust model. Oprávnění (RBAC) ověřuj na úrovni serveru.

4. **Error Handling & Observability:** Nikdy nepolykej chyby. Zabal do \`try/catch\`, zaloguj, bezpečně vrať chybový stav.

5. **Databázová hygiena (Neon/Supabase):** 
   - Neon: HTTP driver, žádný pool
   - Supabase: RLS policies, Supavisor pro serverless
   - **NIKDY neprováděj dual-write mezi Neon a Supabase**

6. **Sanitizace uživatelského vstupu:** HTML z CMS MUSÍ projít sanitizací před renderem.

7. **Nezávislost na LLM poskytovateli:** AI integrace abstrahuj přes vrstvu.

8. **Bezpečnost mobilní aplikace:** Tokeny VŽDY v SecureStore.
${c.domainPersona}`

/** template_dbDoc.md */
export const dbDocTpl = (c: GenCtx): string => `# Databázová konfigurace: ${c.p}

## Vybraná strategie
**${c.v.DbStrategy}**

## Integrace s Vercel
**${c.v.VercelDb}**

## Connection Pooling
**${c.v.Pooling}**

## Cache
**${c.v.Cache}**

## Klíčová pravidla

### Neon
- Driver: \`@neondatabase/serverless\` v HTTP režimu
- Preview branches automaticky pro každý PR
- Migrace: \`drizzle-kit push\` nebo \`prisma migrate deploy\`
- Production: pooled URL s \`-pooler\` sufixem

### Supabase
- Connection: **Supavisor** transaction mode
- Direct connection POUZE pro migrace
- RLS: povinné pro všechny tabulky
- Auth: \`@supabase/ssr\` pro Next.js

### Dual-stack
- Preview: Neon branches
- Produkce: Supabase
- **Nikdy nesynchronizuj data mezi Neon a Supabase**

## Zakázané vzory
- ❌ Přímé \`new Pool()\` v serverless funkci
- ❌ Dlouhotrvající transakce přes více requestů
- ❌ Raw SQL bez prepared statements
- ❌ Secrets v kódu
- ❌ Migrace z pooled připojení`

/** template_behaviorDoc.md */
export const behaviorDocTpl = (c: GenCtx): string => `# Chování agenta: ${c.p}

Tyto pokyny platí pro celý repozitář bez ohledu na zvolený tech stack. Popisují, jak se má Copilot chovat
při psaní, úpravě a validaci kódu.

## Sestavení a validace
${c.behaviorBullets(c.lists.BuildValidation)}

## Rozložení projektu
${c.behaviorBullets(c.lists.ProjectLayout)}

## Styl kódu
${c.behaviorBullets(c.lists.CodeStyleBehavior)}

## Testování
${c.behaviorBullets(c.lists.TestingBehavior)}

## Dokumentace
${c.behaviorBullets(c.lists.DocsBehavior)}

## Zabezpečení (obecné)
${c.behaviorBullets(c.lists.SecurityBehavior)}

## Přístupnost
${c.behaviorBullets(c.lists.Accessibility)}

## Výkon
${c.behaviorBullets(c.lists.Performance)}`

/** template_specializationDoc.md */
export const specializationDocTpl = (c: GenCtx): string => `# Specializované moduly: ${c.p}

## Primární doména
**${c.v.AppDomain}**

## Aktivní moduly

### E-shop
${c.lists.Ecommerce}

### Rezervace
${c.lists.Booking}

### SaaS
${c.lists.Saas}

### LMS
${c.lists.Lms}

### CRM
${c.lists.Crm}

## Externí integrace
${c.lists.Integrations}

## Marketing
${c.lists.Marketing}

## Právní požadavky
${c.lists.Legal}

## Doporučené knihovny

| Modul | Knihovna | Účel |
|-------|----------|------|
| E-shop platby | \`stripe\` | Platební brána |
| E-shop platby CZ | \`gopay-sdk\` | CZ platební brána |
| Doprava CZ | \`packeta-api\` | Integrace Packeta |
| Fakturace | \`fakturoid-client\` | Fakturace CZ |
| Email | \`resend\` | Transakční e-maily |
| SMS | \`twilio\` | SMS notifikace |
| Rezervace | \`date-fns-tz\` | Timezone handling |
| Rezervace | \`rrule\` | Opakované události |
| SaaS billing | \`@stripe/stripe-js\` | Client-side checkout |
| SaaS multi-tenant | \`@supabase/ssr\` | RLS + tenant isolation |
| LMS video | \`@mux/mux-node\` | Video streaming |
| CRM pipeline | \`@dnd-kit/core\` | Drag & drop deals |
| Marketing | \`@react-email/components\` | Email šablony |
| Compliance | \`cookiebot\` | GDPR cookies |`

/** template_mobileSection.md */
export const mobileSectionTpl = (c: GenCtx): string => `
# Mobilní aplikace
* **Platforma:** ${c.v.Mobile}
* **Distribuce:** ${c.v.MobileDeploy}
* **Navigace:** ${c.v.MobileNav}
* **UI knihovna:** ${c.v.MobileUi}
* **State & Data:** ${c.v.MobileState}
* **Autentizace:** ${c.v.MobileAuth}

### Mobilní funkce:
${c.lists.MobileFeatures}

### Pravidla pro mobilní část:
- **Sdílené typy:** Vytvoř \`packages/shared-types/\` s TypeScript typy sdílenými mezi webem a mobilem
- **API klient:** Sdílený API klient s automatickým refresh token flow
- **Offline-first:** Drafty a kritická data ukládej do AsyncStorage, synchronizuj při připojení
- **Bezpečnost:** Tokeny VŽDY v SecureStore (nikdy AsyncStorage)
- **Build:** \`eas build --platform android --profile preview\` pro testovací APK`

/** template_neonSection.md */
export const neonSectionTpl = (_c: GenCtx): string => `
### Neon konfigurace (serverless Postgres)
- Používej **@neondatabase/serverless** driver v HTTP režimu (žádný connection pool)
- V serverless funkcích používej \`neon()\` z \`@neondatabase/serverless\`
- Databázové větve (branches) se vytvářejí automaticky pro každý Preview Deployment
- Pro migrace použij \`drizzle-kit\` nebo \`prisma migrate\` s přímým (ne-pooled) připojením
- V produkci použij pooled connection string (\`-pooler\` sufix)
- Scale-to-zero: neaktivní větve se po 5 minutách pozastaví`

/** template_supabaseSection.md */
export const supabaseSectionTpl = (_c: GenCtx): string => `
### Supabase konfigurace (all-in-one BaaS)
- Používej **Supavisor connection pooler** (transaction mode) pro serverless funkce
- Direct connection používej POUZE pro migrace
- Row Level Security (RLS) je povinná pro všechny tabulky s uživatelskými daty
- Auth: používej Supabase Auth s vlastními claims pro RBAC
- Storage: použij Supabase Storage pro soubory (alternativa k Vercel Blob)
- Realtime: Supabase Realtime pro live updates (Postgres changes)
- **Neprováděj dual-write stejných dat do Neon i Supabase**`

/** template_vercelSection.md */
export const vercelSectionTpl = (_c: GenCtx): string => `
### Vercel konfigurace
- Používej \`vercel.json\` pro rewrite rules a environment-specific nastavení
- Preview Deployments: automaticky pro každý PR (integrace s Neon branching)
- Edge Functions: pro geograficky distribuované API endpointy
- Blob Storage: pro uživatelské soubory (alternativa k S3)
- Analytics + Speed Insights: povinné pro monitoring produkce
- **Cron Jobs:** pro plánované úlohy (cleanup, e-maily, reporty)`

/** template_tipTapSection.md */
export const tipTapSectionTpl = (_c: GenCtx): string => `
### TipTap editor konfigurace
- Použij **@tiptap/react** + **@tiptap/starter-kit** jako základ
- Pro uložení používej **JSON formát** (ne HTML)
- Vlastní extensiony: vytvoř \`extensions/\` složku pro vlastní node/mark typy
- Renderuj obsah bezpečně pomocí **generateHTML()** z \`@tiptap/html\` na serveru
- **Nikdy nepoužívej dangerouslySetInnerHTML** bez předchozí sanitizace`

/** template_legalSection.md */
export const legalSectionTpl = (_c: GenCtx): string => `
### Právní a compliance (CZ/SK specifika)
- **GDPR:** souhlas s cookies musí být **opt-in**
- **14 dní na vrácení:** stav objednávky \`RETURN_REQUESTED\`
- **Reklamace:** zákonná lhůta 30 dní
- **DPH:** kalkulace vč. reverse charge pro EU B2B
- **Obchodní podmínky:** verzované`

/** template_agentTaskSection.md */
export const agentTaskSectionTpl = (c: GenCtx): string => `## Agent Task

### Cíl
Doplňovat a udržovat projekt podle specifikace výše: **${c.v.AppDomain}** postavená nad ${c.stackPair(c.v.Fe, c.v.Be)} a ${c.v.DbStrategy}.

### Rozsah práce
- Dodržuj architekturu, tech stack a databázová pravidla z tohoto souboru, případně z \`.github/skills/SKILL.md\`.
- Neměň strukturu repozitáře ani závislosti, pokud to zadání explicitně nevyžaduje.
- Malé, soustředěné změny s testy a popisem v pull requestu.

### Kroky
1. Načti tento soubor a relevantní skilly.
2. Ověř, že rozumíš zadání; při nejasnosti se zeptej, nedomýšlej si.
3. Implementuj nejmenší funkční změnu.
4. Přidej nebo uprav testy.
5. Spusť lint, typovou kontrolu a testy.
6. Shrň změnu a její dopady.

### Kritéria hotovo
- [ ] Kód je typově bezpečný a prochází lintem.
- [ ] Testy pokrývají nové nebo změněné chování.
- [ ] Nejsou přidány nedeklarované závislosti ani tajemství.
- [ ] Změna je popsána v pull requestu včetně dopadů.`

/** template_specializedSection.md */
export const specializedSectionTpl = (c: GenCtx): string => `
## 8. Specializované moduly a doména
* **Primární doména aplikace:** ${c.v.AppDomain}

**E-shop moduly:**
${c.lists.Ecommerce}

**Rezervační moduly:**
${c.lists.Booking}

**SaaS moduly:**
${c.lists.Saas}

**LMS moduly:**
${c.lists.Lms}

**CRM moduly:**
${c.lists.Crm}

**Integrace třetích stran:**
${c.lists.Integrations}

**Marketing & Growth:**
${c.lists.Marketing}

**Právní & Compliance:**
${c.lists.Legal}`

/** template_readme.md */
export const readmeTpl = (c: GenCtx): string => `# ${c.p}

## Cíl projektu
${c.goalText}

## Zvolený základ
- Doména: ${c.v.AppDomain}
- Cílová platforma: ${c.v.Target}
- Frontend: ${c.v.Fe}
- Backend: ${c.v.Be}
- Databáze: ${c.v.DbStrategy}

## Kontext pro AI nástroje
- \`PROJECT_PLAN.md\`: lidský plán a fáze vývoje.
- \`project.config.json\`: strojově čitelná konfigurace.
- \`.github/copilot-instructions.md\`: pravidla a technický kontext pro Copilot.
- \`AGENTS.md\`: pracovní pravidla coding agenta.
- \`.env.example\`: přehled očekávaných proměnných prostředí.

Před implementací si přečti \`PROJECT_PLAN.md\` a \`.github/copilot-instructions.md\`.`

/** template_contrib.md */
export const contribTpl = (c: GenCtx): string => `# Přispívání do projektu ${c.p}

## Postup
1. Vytvoř větev s popisným názvem (například \`feat/kosik-slevy\`).
2. Proveď změnu včetně testů.
3. Spusť lint, typovou kontrolu a testy.
4. Otevři pull request a vyplň popis změny i dopadů.
5. Po schválení a zeleném CI proveď merge.

## Požadavky na pull request
- Malý a soustředěný na jednu věc.
- Zelené CI.
- Popis: co se změnilo, proč a jaké to má dopady.
- U změny databáze i postup migrace a návratu.

## Konvence commitů
Používej konvenční formát: \`typ(oblast): popis\` (například \`fix(api): validace e-mailu\`).
Typy: \`feat\`, \`fix\`, \`docs\`, \`refactor\`, \`test\`, \`chore\`.

## Co nikdy nedělat
- Necommituj tajemství, klíče ani soubory \`.env\`.
- Nepřidávej závislosti bez dohody.
- Nevypínej testy ani kontroly, abys prošel.`

/** template_envExample.md */
export const envExampleTpl = (_c: GenCtx): string => `# Zkopíruj do .env.local a doplň pouze lokální hodnoty.
# Tajemství nikdy necommituj do repozitáře.
DATABASE_URL=
AUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
SENTRY_DSN=`

/** template_domainPersonaEshop.md */
export const domainPersonaEshop = (_c: GenCtx): string => `
### E-commerce pravidla (Kritická)
- Ceny VŽDY v minor units (haléře) jako \`integer\`, nikdy \`float\`
- Skladové množství ověřuj **atomicky** (SELECT FOR UPDATE nebo optimistic locking)
- Order je **immutable** po zaplacení
- Webhooky platebních bran MUSÍ být **idempotentní**
- Doprava a DPH se počítají **VŽDY na serveru**
- GDPR: ukládej pouze nezbytné údaje`

/** template_domainPersonaBooking.md */
export const domainPersonaBooking = (_c: GenCtx): string => `
### Rezervační pravidla (Kritická)
- Všechny časy v **UTC** v DB
- Race conditions: rezervaci VŽDY přes **transaction** s unique constraint
- Overbooking: zabraň na **DB úrovni** (exclusion constraint)
- Storno policy: definuj okno (např. 24h předem)
- Notifikace: T-24h reminder + T-1h confirmation`

/** template_domainPersonaSaaS.md */
export const domainPersonaSaaS = (_c: GenCtx): string => `
### SaaS pravidla (Kritická)
- Multi-tenancy: každý záznam má \`tenant_id\`
- Subscription stav VŽDY ověřuj na **serveru**
- Webhooky Stripe: **verify signature**, idempotence
- Feature gating: **deklarativní**
- Dunning: selhání platby → 3 pokusy → downgrade`

/** template_domainPersonaLMS.md */
export const domainPersonaLMS = (_c: GenCtx): string => `
### LMS pravidla
- Video obsah: **signed URLs** s expirací
- Progress tracking: per-user
- Certifikáty: PDF s **verifikačním kódem**
- Kvízy: server-side validace`

/** template_domainPersonaCRM.md */
export const domainPersonaCRM = (_c: GenCtx): string => `
### CRM pravidla
- Soft delete pro kontakty
- Deduplikace podle emailu
- Audit log: immutable append-only`

/** fn_Get-RepoStructure.ps1[0] */
export const repoTreeMonorepo = (_c: GenCtx): string => `\`\`\`
.
├── apps/
│   ├── web/                     # veřejná aplikace
│   ├── admin/                   # administrace
│   └── mobile/                  # mobilní aplikace (pokud je zvolena)
├── packages/
│   ├── shared-types/            # typy sdílené mezi aplikacemi
│   ├── ui/                      # sdílené UI komponenty
│   └── config/                  # sdílená konfigurace (eslint, tsconfig)
├── .github/
│   ├── copilot-instructions.md
│   ├── workflows/
│   └── skills/
└── package.json
\`\`\`
`

/** fn_Get-RepoStructure.ps1[1] */
export const repoTreeNext = (_c: GenCtx): string => `\`\`\`
src/
├── app/                         # App Router
│   ├── layout.tsx               # root layout
│   ├── page.tsx                 # homepage
│   ├── (auth)/                  # skupina chráněných rout
│   ├── api/                     # route handlers
│   └── globals.css
├── components/
│   ├── ui/                      # základní komponenty (Shadcn)
│   ├── forms/                   # formuláře
│   └── layout/                  # hlavička, patička, navigace
├── lib/                         # pomocné funkce (db, auth, utils)
├── schemas/                     # validační schémata (Zod)
├── actions/                     # Server Actions
├── types/                       # sdílené typy
└── __tests__/                   # testy vedle kódu nebo zde
\`\`\`
`

/** fn_Get-RepoStructure.ps1[2] */
export const repoTreeVue = (_c: GenCtx): string => `\`\`\`
src/
├── pages/                       # souborové routování
├── components/
│   ├── ui/                      # základní komponenty
│   └── forms/                   # formuláře
├── composables/                 # znovupoužitelná logika
├── stores/                      # stav aplikace
├── schemas/                     # validační schémata
├── types/                       # sdílené typy
└── __tests__/
\`\`\`
`

/** fn_Get-RepoStructure.ps1[3] */
export const repoTreeGeneric = (_c: GenCtx): string => `\`\`\`
src/
├── components/
│   ├── ui/                      # základní komponenty
│   ├── forms/                   # formuláře
│   └── layout/                  # rozložení stránky
├── lib/                         # pomocné funkce
├── schemas/                     # validační schémata
├── services/                    # přístup k datům a API
├── types/                       # sdílené typy
└── __tests__/
\`\`\`
`

/** fn_Get-WorkflowExamples.ps1[0] */
export const workflowExamplesTpl = (c: GenCtx): string => `## Workflow pro typové úlohy

Konkrétní postup pro činnosti, které budeš dělat opakovaně.

### Nový formulář
1. Vytvoř schéma: \`schemas/<nazev>.ts\`.
${c.hasValidation ? "2. Použij ho na klientu i serveru - jedno schéma, jedna pravda." : "2. Validuj vstup na serveru, klientská validace je jen pro pohodlí uživatele."}
3. Komponentu umísti do \`components/forms/<NazevForm.tsx>\`.
4. Přidej test: platná data projdou, neplatná vrátí chybu u konkrétního pole.
5. Ošetři stav odesílání, aby se formulář neodeslal dvakrát.

### Nový API endpoint
1. Zvol metodu podle významu (GET čte, POST vytváří, PATCH mění, DELETE maže).
2. Validuj vstup na hranici API a vracej stav 400 s popisem konkrétního pole.
3. Ověř oprávnění **na serveru**, nikdy podle údaje z klienta.
4. Chybu zaloguj s korelačním ID a vrať srozumitelnou odpověď bez interních detailů.
5. Napiš test včetně chybových stavů.

### Nová komponenta
1. Rozhodni, zda jde o prezentační komponentu, nebo obal s logikou.
2. Drž ji malou - jedna odpovědnost.
3. Texty nepiš přímo do komponenty.
4. Zkontroluj ovládání klávesnicí a kontrast.
5. Pokud jde o obecně použitelnou komponentu, přidej ji do \`components/ui\`.

### Nalezená bezpečnostní chyba
1. **Nezveřejňuj** detail zranitelnosti v commitu ani v popisu pull requestu.
2. Oprav ji v samostatné větvi a v samostatném pull requestu.
3. Přidej regresní test, který selže před opravou a projde po ní.
4. Ověř, zda stejná chyba není i jinde.
5. Uveď dopad a doporučený postup v soukromém kanálu, ne ve veřejném issue.

### Změna databázového schématu
1. Napiš migraci - nikdy needituj databázi ručně.
2. Drž migraci zpětně kompatibilní (přidej sloupec, počkej, teprve pak odeber).
3. Otestuj na kopii produkčních dat.
4. Připrav postup návratu.
`

/** fn_Get-AntiPatterns.ps1[0] */
export const antiPattern1 = (c: GenCtx): string => `### 1. Texty napevno v komponentě

${c.fence}
// ŠPATNĚ - text nejde přeložit ani upravit bez zásahu do kódu
<h1>Moje aplikace</h1>

// SPRÁVNĚ - text pochází ze slovníku
<h1>{t('header.title')}</h1>
${c.fence}
`

/** fn_Get-AntiPatterns.ps1[1] */
export const antiPattern2 = (c: GenCtx): string => `### 2. Přímý přístup k databázi z komponenty

${c.fence}
// ŠPATNĚ - komponenta obchází vrstvy a obchází kontrolu oprávnění
const data = await db.query('SELECT * FROM users')

// SPRÁVNĚ - přístup jde přes serverovou vrstvu
const data = await getUsers()
${c.fence}
`

/** fn_Get-AntiPatterns.ps1[2] */
export const antiPattern3 = (c: GenCtx): string => `### 3. Tajemství v klientském kódu

${c.fence}
# ŠPATNĚ - cokoli s předponou NEXT_PUBLIC_ nebo VITE_ je veřejné!
NEXT_PUBLIC_API_KEY=sk_live_xxxxx

# SPRÁVNĚ - veřejná je jen adresa, klíč zůstává na serveru
NEXT_PUBLIC_API_URL=https://api.example.com
PRIVATE_API_KEY=sk_live_xxxxx
${c.fence}
`

/** fn_Get-AntiPatterns.ps1[3] */
export const antiPattern4 = (c: GenCtx): string => `### 4. Obcházení typového systému

${c.fence}
// ŠPATNĚ - přetypováním ztratíš kontrolu
const user = data as any

// SPRÁVNĚ - ověř tvar dat, dokud nejsou ověřená
const user = userSchema.parse(data)
${c.fence}
`

/** fn_Get-AntiPatterns.ps1[4] */
export const antiPattern5 = (c: GenCtx): string => `### 5. Ověřování oprávnění na klientu

${c.fence}
// ŠPATNĚ - uživatel si roli přepíše v prohlížeči
if (user.role === 'admin') { deleteUser(id) }

// SPRÁVNĚ - rozhoduje server, klient jen skrývá UI
await deleteUser(id) // uvnitř si server ověří roli
${c.fence}
`

/** fn_Get-AntiPatterns.ps1[5] */
export const antiPattern6 = (c: GenCtx): string => `### 6. Nejdřívější návrat přes hluboké podmínky

${c.fence}
// ŠPATNĚ - hluboké zanoření se špatně čte
function render(user) {
  if (user) {
    if (user.active) {
      if (user.email) {
        return user.email
      }
    }
  }
}

// SPRÁVNĚ - okrajové stavy vyřeš hned na začátku
function render(user) {
  if (!user || !user.active || !user.email) return null
  return user.email
}
${c.fence}
`

/** fn_Get-TaskPrompt.ps1[0] */
export const taskPromptTpl = (c: GenCtx): string => `# Úkolový prompt: ${c.p}

Od teď v tomto repozitáři vystupuješ jako **${c.role}**. Neodpovídej obecně - dodávej
konkrétní, otestovaný a nasaditelný kód, který respektuje níže uvedený kontext.

## Tvoje role
* Navrhuj a implementuj funkce od databáze po UI.
* Drž se zvoleného tech stacku a architektury, nevnucuj alternativy.
* Piš kód tak, aby mu rozuměl i někdo, kdo projekt vidí poprvé.
* U každé změny vysvětli dopad a rizika.

## Kontext projektu
${c.stackLines.join("\n")}

## Hlavní úkoly

${c.taskBody}

### Průběžné úkoly (platí vždy)
- Udržuj build, typovou kontrolu a lint zelené.
- Ke každé nové nebo změněné funkci přidej test.
- Neměň strukturu repozitáře ani závislosti bez výslovného zadání.
- Nikdy necommituj tajemství, klíče ani soubory \`.env\`.
- Validuj a sanitizuj veškerý vstup na serveru.
- Zapisuj chyby do logu, nepolykej je.

## Jak postupovat
1. Přečti \`.github/copilot-instructions.md\` a případně \`.github/skills/SKILL.md\`.
2. Prozkoumej relevantní část kódu, než cokoli změníš.
3. Navrhni nejmenší funkční změnu a krátce ji popiš.
4. Implementuj ji včetně testů.
5. Spusť lint, typovou kontrolu a testy.
6. Shrň, co se změnilo, proč a jaké to má dopady.

## Když si nejsi jistý
- Zeptej se místo domýšlení. Uveď, co přesně potřebuješ vyjasnit.
- Když najdeš v zadání rozpor, upozorni na něj a navrhni řešení.

## Co nikdy nedělat
- Nepřidávej závislosti, které nejsou v manifestu.
- Neobcházej ověřování oprávnění na serveru.
- Nevypínej testy ani kontroly, abys "prošel".
- Nepřepisuj cizí funkční kód bez důvodu.

## Kritéria hotovo
- [ ] Zadání je splněno a popsáno.
- [ ] Testy procházejí a pokrývají nové chování.
- [ ] Lint a typová kontrola bez chyb.
- [ ] Žádné nové nedeklarované závislosti ani tajemství.
- [ ] Dopady a případná migrace jsou popsané.
`

/** fn_Get-AgentsMd.ps1[0] */
export const agentsMdTpl = (c: GenCtx): string => `# AGENTS.md — ${c.p}

Univerzální instrukce pro AI coding agenty (Copilot, Codex, Cursor, Claude Code, Gemini CLI, Aider).
Soubor leží v kořeni repozitáře; agent použije nejbližší \`AGENTS.md\` v adresářovém stromu.

## Přehled projektu
* **Architektura:** ${c.v.Arch} — ${c.v.ArchType}
* **Cílové platformy:** ${c.v.Target}
* **Frontend:** ${c.stackPair(c.v.Fe, c.v.Css)}
* **Backend:** ${c.v.Be}
* **Databáze:** ${c.v.DbStrategy}
* **Doména:** ${c.v.AppDomain}
* **Nasazení:** ${c.v.Deploy}

## Příkazy
- Instalace závislostí: \`${c.cmdInstall}\`
- Vývojový server: \`${c.cmdDev}\`
- Produkční build: \`${c.cmdBuild}\`
- Testy: \`${c.cmdTest}\`
- Lint a formát: \`${c.cmdLint}\`
- Typová kontrola: \`${c.cmdTypecheck}\`

> Ověř názvy skriptů ve \`package.json\` a tento seznam uprav podle skutečnosti.

## Konvence kódu
- Striktní typy, žádné \`any\`.
- Validuj vstup na serveru, nikdy nedůvěřuj klientu.
- Texty nepatří do komponent, ale do i18n slovníků.
- Nikdy necommituj tajemství ani soubory \`.env\`.
- Nové chování vždy doplň testem.

## Kde jsou instrukce
* \`.github/copilot-instructions.md\` — plný kontext projektu (vždy aktivní pro Copilot)
${c.modeExtended ? "* `.github/skills/SKILL.md` — postupy a kontrolní seznamy (načítané podle potřeby)\n" : ''}* \`AGENTS.md\` — tento soubor, společný pro všechny agenty
`

/** fn_Get-AgentTaskMd.ps1[0] */
export const agentTaskMdTpl = (c: GenCtx): string => `---
name: agent-task-${c.slug}
description: Provádí zadané úlohy v projektu ${c.p} podle pravidel v .github/copilot-instructions.md.
---

# Agent Task: ${c.p}

## Účel
Samostatný agent pro plnění zadaných úloh v tomto repozitáři. Pracuje podle
\`.github/copilot-instructions.md\` a případně \`.github/skills/SKILL.md\`.

## Kontext projektu
* **Doména:** ${c.v.AppDomain}
* **Architektura:** ${c.v.Arch} — ${c.v.ArchType}
* **Frontend:** ${c.stackPair(c.v.Fe, c.v.Css)}
* **Backend:** ${c.v.Be}
* **Databáze:** ${c.v.DbStrategy}

## Pravidla
1. Nejdřív si přečti instrukce a relevantní skilly, teprve pak měň kód.
2. Drž se zvoleného tech stacku, nepřidávej závislosti bez schválení.
3. Nikdy necommituj tajemství ani soubory \`.env\`.
4. Validuj vstup na serveru, ošetři chyby a zaloguj je.
5. Změny dělej malé a srozumitelné, s testy.

## Postup
1. Přečti zadání a instrukce.
2. Prozkoumej relevantní část kódu.
3. Naplánuj nejmenší funkční změnu.
4. Implementuj a přidej testy.
5. Spusť lint, typovou kontrolu a testy.
6. Vytvoř pull request s popisem změny a dopadů.

## Kritéria hotovo
- [ ] Zadání je splněno a popsáno v pull requestu.
- [ ] Testy procházejí a pokrývají nové chování.
- [ ] Lint a typová kontrola bez chyb.
- [ ] Žádné nové nedeklarované závislosti ani tajemství.
`

/** fn_Get-SetupSteps.ps1[0] */
export const setupHeaderTpl = (_c: GenCtx): string => `name: "Copilot Setup Steps"

# Prostředí pro Copilot coding agent. Název jobu MUSÍ být 'copilot-setup-steps'.
on:
  workflow_dispatch:
  push:
    paths:
      - .github/workflows/copilot-setup-steps.yml
  pull_request:
    paths:
      - .github/workflows/copilot-setup-steps.yml

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4
`

/** fn_Get-SetupSteps.ps1[1] */
export const setupPythonTpl = (_c: GenCtx): string => `      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
          if [ -f pyproject.toml ]; then pip install -e .; fi

      - name: Lint
        run: |
          if command -v ruff >/dev/null 2>&1; then ruff check .; fi

      - name: Type check
        run: |
          if command -v mypy >/dev/null 2>&1; then mypy .; fi

      - name: Test
        run: |
          if [ -f pytest.ini ] || [ -d tests ]; then pytest -q; fi
`

/** fn_Get-SetupSteps.ps1[2] */
export const setupGoTpl = (_c: GenCtx): string => `      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.23'
          cache: true

      - name: Install dependencies
        run: go mod download

      - name: Build
        run: go build ./...

      - name: Vet
        run: go vet ./...

      - name: Test
        run: go test ./...
`

/** fn_Get-SetupSteps.ps1[3] */
export const setupRustTpl = (_c: GenCtx): string => `      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy, rustfmt

      - name: Install dependencies
        run: cargo fetch

      - name: Format check
        run: cargo fmt --all -- --check

      - name: Clippy
        run: cargo clippy --all-targets -- -D warnings

      - name: Test
        run: cargo test --all
`

/** fn_Get-SetupSteps.ps1[4] */
export const setupEdgeTpl = (c: GenCtx): string => `      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: ${c.usePnpm ? "pnpm" : "npm"}
${c.usePnpm ? "\n      - name: Setup pnpm\n        uses: pnpm/action-setup@v4\n        with:\n          version: 9\n" : ''}
      - name: Install dependencies
        run: ${c.usePnpm ? "pnpm install --frozen-lockfile" : "npm ci"}

      - name: Type check
        run: ${c.usePnpm ? "pnpm typecheck" : "npm run typecheck"}

      - name: Lint
        run: ${c.usePnpm ? "pnpm lint" : "npm run lint"}

      - name: Test
        run: ${c.usePnpm ? "pnpm test" : "npm test"}
`

/** fn_Get-SetupSteps.ps1[5] */
export const setupNodeTpl = (c: GenCtx): string => `${c.usePnpm ? "      - name: Setup pnpm\n        uses: pnpm/action-setup@v4\n        with:\n          version: 9\n\n" : ''}      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: ${c.usePnpm ? "pnpm" : "npm"}

      - name: Install dependencies
        run: ${c.usePnpm ? "pnpm install --frozen-lockfile" : "npm ci"}

      - name: Type check
        run: ${c.usePnpm ? "pnpm typecheck" : "npm run typecheck"}

      - name: Lint
        run: ${c.usePnpm ? "pnpm lint" : "npm run lint"}

      - name: Test
        run: ${c.usePnpm ? "pnpm test" : "npm test"}
`

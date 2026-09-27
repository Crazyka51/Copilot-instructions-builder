// Parity check: porovná výstup TypeScript generátoru s výstupem PowerShell builderu.
// Použití: node scripts/parity.mjs [cesta-k-ps1]
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolvePs1, sha256 } from './resolve-ps1.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const validateOnly = process.argv.includes('--validate-only')

let ps1 = null
if (!validateOnly) {
  try {
    ps1 = resolvePs1(process.argv[2])
  } catch (error) {
    console.error(error.message ?? String(error))
    process.exit(1)
  }
  console.log(`Zdroj: ${ps1}`)
  console.log(`SHA256: ${sha256(ps1)}`)
}

const cards = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'cards.json'), 'utf8'))
const cardById = new Map(cards.map((c) => [c.id, c]))

/** Scénáře: stejné volby se nastaví na obou stranách. */
const scenarios = [
  {
    label: 'konsolidovaný formát',
    preset: ['E-shop / E-commerce', 'Next.js (App Router)', 'React Native + Expo (SDK 57+)'],
    selection: {
      rAppDomain: ['E-shop / E-commerce'],
      rFe: ['Next.js (App Router)'],
      rTarget: ['Web + Administrace'],
      rMobile: ['React Native + Expo (SDK 57+)'],
      rSkillOutput: ['Konsolidovaný (instrukce + agent + setup)'],
      rSkillScope: ['Pouze zaškrtnuté skilly'],
      cSkillContent: ['Kontrolní seznam (checklist)', 'Příklad použití'],
      cSkillFrontMatter: ['Úkolový prompt v instrukcích'],
      cProjectDocs: ['Struktura repozitáře', 'Anti-patterns (co nikdy nedělat)'],
      cProjectFiles: ['PROJECT_PLAN.md (fáze vývoje)', '.agentic/manifest.json (strojový kontext)'],
      cEcommerce: ['Product catalog (varianty, SKU)', 'Košík + checkout flow', 'Platební brána (Stripe / GoPay)'],
      cCore: ['Platby (Stripe)', 'E-maily (Resend / Postmark)'],
      cLegal: ['GDPR (souhlasy, výmaz)', 'Obchodní podmínky'],
      cBuildValidation: ['Spusťte testovací sadu', 'Kontrola typů'],
      cAccessibility: ['Sémantické HTML', 'Navigace klávesnicí'],
      cTest: ['Vitest', 'Playwright (E2E)'],
      cCiCd: ['GitHub Actions', 'Automatické testy na PR'],
      rDbStrategy: ['Neon (serverless Postgres, vlastní Auth)'],
      rOrm: ['Prisma'],
      rAuthType: ['NextAuth v5 / Auth.js'],
      rDeploy: ['Vercel (BaaS + Edge)'],
      rBe: ['Next.js API Routes / Server Actions'],
      rRender: ['ISR (Incremental Static Regeneration)'],
      rCss: ['Tailwind CSS + Shadcn/UI'],
      rCmsEditor: ['TipTap (headless, vlastní UI)'],
      rDesign: ['Moderní & Minimalistický (Shadcn styl)'],
      cPresetOptions: ['Před aplikací vyčistit doporučené skupiny']
    },
    skills: ['Validace API vstupů', 'Ochrana proti XSS', 'Datové modelování']
  },
  {
    label: 'rozšířený formát, SaaS, Python, pnpm',
    preset: ['SaaS platforma'],
    selection: {
      rAppDomain: ['SaaS platforma'],
      rFe: ['SvelteKit'],
      rTarget: ['Web + Administrace + Mobilní aplikace'],
      rSkillOutput: ['Rozšířený (+ skills a agent-task)'],
      rSkillScope: ['Všechny skilly (kompletní sada)'],
      cSkillContent: ['Kontrolní seznam (checklist)', 'Příklad použití', 'Odkazy na související soubory'],
      cSkillFrontMatter: ['Frontmatter s metadaty', 'Souhrnná tabulka skills', 'Úkolový prompt v instrukcích', 'Úkolový prompt jako samostatný soubor'],
      cProjectDocs: ['Struktura repozitáře', 'Workflow příklady (formulář, API, komponenta)', 'Anti-patterns (co nikdy nedělat)', 'Kontrolní seznam pro code review'],
      cProjectFiles: ['PROJECT_PLAN.md (fáze vývoje)', '.agentic/manifest.json (strojový kontext)', 'CONTRIBUTING.md (postup přispívání)'],
      cSaas: ['Multi-tenant architektura', 'Subscription billing (Stripe Billing)', 'Plány + feature gating'],
      cAdmin: ['Dashboard (Statistiky, grafy)', 'Správa uživatelů (Tabulky)'],
      cAuth: ['RBAC (Admin/User/Moderator)', '2FA / TOTP'],
      cSec: ['T3 Env (Validace .env přes Zod)', 'Rate Limiting'],
      cCompliance: ['GDPR (cookie consent, RLS)', 'Audit trail (kdo co změnil)'],
      rArch: ['pnpm workspaces + apps/ (monorepo)'],
      rArchType: ['Modulární monolit (moduly s vlastními hranicemi)'],
      rDbStrategy: ['Supabase (kompletní backend: DB + Auth + Storage)'],
      rVercelDb: ['Supabase Marketplace (one-click)'],
      rOrm: ['Drizzle ORM'],
      rPooling: ['Supabase Supavisor (transaction mode)'],
      rAuthType: ['Supabase Auth'],
      rBe: ['Python (FastAPI / Django)'],
      rDeploy: ['Docker Container (VPS/AWS)'],
      rRender: ['SSR (Server-Side Rendering)'],
      rCss: ['Tailwind CSS (čistý)'],
      rForms: ['React Hook Form + Zod'],
      rMobile: ['Flutter'],
      rMobileDeploy: ['App Store / Google Play'],
      rMobileNav: ['React Navigation'],
      rMobileUi: ['Tamagui'],
      rMobileState: ['Jotai + SWR'],
      rMobileAuth: ['Biometrické + PIN'],
      cMobileFeatures: ['SecureStore pro tokeny', 'Push notifikace (Expo Notifications)'],
      cIntegrations: ['Platby: Stripe', 'Email: Resend / Postmark'],
      cMarketing: ['Newsletter', 'Sitemap + robots.txt'],
      cLms: ['Kurzy + lekce'],
      cCrm: ['Kontakty + firmy'],
      cObservability: ['Sentry (chyby)'],
      cLog: ['Pino (JSON logy)'],
      cAccessibility: ['Sémantické HTML'],
      cPerformance: ['Velikost svazku'],
      cProjectLayout: ['Dodržujte stávající strukturu'],
      cCodeStyle: ['Preferujte konst'],
      cTestingBehavior: ['Pokrytí pro nové kódy'],
      cDocsBehavior: ['JSDoc/Docstringy'],
      cSecurityBehavior: ['Ověřujte vstupy'],
      rIac: ['Terraform']
    },
    skills: []
  },
  {
    label: 'jen instrukce, mobil, Expo',
    preset: ['Web + Mobilní aplikace (bez adminu)'],
    selection: {
      rAppDomain: ['Obecná / Univerzální'],
      rTarget: ['Web + Mobilní aplikace (bez adminu)'],
      rMobile: ['React Native + Expo (SDK 57+)'],
      rSkillOutput: ['Jen instrukce'],
      rSkillScope: ['Bez skills'],
      cProjectDocs: ['Struktura repozitáře'],
      cProjectFiles: ['PROJECT_PLAN.md (fáze vývoje)'],
      rMobileDeploy: ['Expo EAS Build (cloud)'],
      rMobileNav: ['Expo Router (file-based)'],
      rMobileUi: ['Tamagui'],
      rMobileState: ['Zustand + TanStack Query'],
      rMobileAuth: ['Expo AuthSession (OAuth)'],
      cMobileFeatures: ['Deep linking', 'Offline drafty (AsyncStorage)'],
      cTest: ['Jest', 'Testing Library (React/Vue)'],
      cCiCd: ['Build APK (Android)'],
      rDesign: ['Hravý / Barevný'],
      cAccessibility: ['Alternativní text u obrázků']
    },
    skills: []
  }
]

const projectSpec = {
  project: 'Parity Test',
  goal: 'Ověřit shodu generátoru mezi PowerShell a webovou verzí.',
  spec: {
    creates: 'E-shop s doplňky',
    audience: 'malé firmy',
    tech: 'Next.js, TypeScript',
    functions: 'katalog, košík, platby',
    files: 'app/, components/, lib/',
    forbiddenDependencies: 'žádné balíčky bez schválení'
  }
}

// rozbalit preset (stejně jako tlačítko v UI) - jen doména a framework
const presetData = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'presets.json'), 'utf8'))
function expandPreset(selection, label) {
  const entries = presetData.presets[label] ?? []
  const next = { ...selection }
  for (const e of entries) {
    const card = cardById.get(e.card)
    if (!card) continue
    const isRadio = card.kind === 'radio'
    let values = next[e.card] ?? []
    if (isRadio) values = []
    for (const item of card.options) {
      if (!e.items.includes(item)) continue
      if (!values.includes(item)) values = isRadio ? [item] : [...values, item]
    }
    next[e.card] = values
  }
  return next
}

function runScenario(scenario, workDir) {
  const skillsData = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'skills.json'), 'utf8'))
  const allSkills = skillsData.skills
  let selection = { ...scenario.selection }
  for (const label of scenario.preset) selection = expandPreset(selection, label)
  selection.skillGroups = scenario.skills.length ? scenario.skills : allSkills.map((s) => s.title)

  // ---------- config pro PowerShell ----------
  const configCards = {}
  for (const card of cards) {
  if (card.dynamic) continue
  const values = (selection[card.id] ?? []).filter((v) => card.options.includes(v))
  if (values.length) configCards[`${card.tab}|${card.title}`] = values
}
// skills jsou v PowerShell verzi karty podle kategorií
// skills pro scénář (PowerShell je má jako karty podle kategorií)
const titles = selection.skillGroups.filter((t) => allSkills.some((s) => s.title === t))
for (const category of [...new Set(allSkills.map((s) => s.category))]) {
  const cat = allSkills.filter((s) => s.category === category && titles.includes(s.title)).map((s) => s.title)
  if (cat.length) configCards[`Skills|${category}`] = cat
}
const psConfig = {
  version: 1,
  project: projectSpec.project,
  goal: projectSpec.goal,
  spec: projectSpec.spec,
  cards: configCards,
  skills: selection.skillGroups
}

const psConfigPath = path.join(workDir, 'config.json')
fs.writeFileSync(psConfigPath, JSON.stringify(psConfig, null, 2), 'utf8')

const tsConfigPath = path.join(workDir, 'scenario.json')
fs.writeFileSync(tsConfigPath, JSON.stringify({ project: projectSpec, selection }), 'utf8')

// ---------- PowerShell ----------
const psOut = path.join(workDir, 'ps')
fs.mkdirSync(psOut, { recursive: true })
console.log('spouštím PowerShell harness…')
execFileSync(
  shell,
  ['-STA', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(here, 'harness.ps1'), '-Source', ps1, '-Config', psConfigPath, '-OutRoot', psOut],
  { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, CB_OUT_ROOT: psOut } }
)

// PowerShell ukládá do podsložky CopilotContext_<název>
const psRoots = fs.readdirSync(psOut).filter((d) => fs.statSync(path.join(psOut, d)).isDirectory())
if (!psRoots.length) throw new Error('PowerShell nevytvořil žádnou složku')
const psRoot = path.join(psOut, psRoots[0])
console.log(`PowerShell: ${psRoots[0]}`)

// ---------- TypeScript ----------
const tsOut = path.join(workDir, 'ts')
fs.mkdirSync(tsOut, { recursive: true })
execFileSync('npx', ['tsx', path.join(here, 'gen-ts.ts'), tsConfigPath, tsOut], { stdio: 'inherit', cwd: root, shell: true })

// ---------- porovnání ----------
function walk(dir, base = dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, base))
    else out.push(path.relative(base, full).replace(/\\/g, '/'))
  }
  return out.sort()
}

const psFiles = walk(psRoot)
const tsFiles = walk(tsOut)
console.log(`\nPowerShell: ${psFiles.length} souborů`)
console.log(`TypeScript: ${tsFiles.length} souborů`)

  const all = [...new Set([...psFiles, ...tsFiles])].sort()
let same = 0
const diffs = []
const norm = (s) => s.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n+$/g, '')
const stableJson = (s) => {
  try {
    return JSON.stringify(sortKeys(JSON.parse(s)))
  } catch {
    return null
  }
}
function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sortKeys(value[k])]))
  }
  return value
}

for (const rel of all) {
  const a = psFiles.includes(rel) ? fs.readFileSync(path.join(psRoot, rel), 'utf8') : null
  const b = tsFiles.includes(rel) ? fs.readFileSync(path.join(tsOut, rel), 'utf8') : null
  if (a === null) { diffs.push({ rel, kind: 'jen v TypeScript' }); continue }
  if (b === null) { diffs.push({ rel, kind: 'jen v PowerShell' }); continue }
  if (norm(a) === norm(b)) { same++; continue }
  // JSON porovnáváme strukturálně (PowerShell jinak formátuje)
  if (rel.endsWith('.json')) {
    const ja = stableJson(a)
    const jb = stableJson(b)
    if (ja && jb && ja === jb) { same++; continue }
    diffs.push({ rel, kind: 'JSON se liší strukturálně', jsonDiff: deepDiff(JSON.parse(a), JSON.parse(b)) })
    continue
  }
  diffs.push({ rel, kind: 'odlišný obsah', a, b })
}

function deepDiff(a, b, path = '') {
  const out = []
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)
  if (Array.isArray(a) && Array.isArray(b)) {
    const n = Math.max(a.length, b.length)
    for (let i = 0; i < n; i++) out.push(...deepDiff(a[i], b[i], `${path}[${i}]`))
    return out
  }
  if (isObj(a) && isObj(b)) {
    for (const key of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()) {
      out.push(...deepDiff(a[key], b[key], path ? `${path}.${key}` : key))
    }
    return out
  }
  if (JSON.stringify(a) !== JSON.stringify(b)) out.push(`${path || '(root)'}: PS=${JSON.stringify(a)} TS=${JSON.stringify(b)}`)
  return out
}

  return { same, total: all.length, diffs, psRoot, tsOut }
}

// ---------- validace scénářů ----------
let invalidScenarios = 0
{
  const knownSkills = new Set(
    JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'skills.json'), 'utf8')).skills.map((s) => s.title)
  )
  let invalid = 0
  for (const scenario of scenarios) {
    for (const [cardId, values] of Object.entries(scenario.selection)) {
      const card = cardById.get(cardId)
      if (!card) {
        console.log(`WARN scenar "${scenario.label}": neznama karta ${cardId}`)
        invalid++
        continue
      }
      for (const value of values) {
        if (!card.options.includes(value)) {
          console.log(`WARN scenar "${scenario.label}": karta ${cardId} nema volbu "${value}"`)
          invalid++
        }
      }
    }
    for (const label of scenario.preset) {
      if (!presetData.presets[label]) {
        console.log(`WARN scenar "${scenario.label}": neznamy preset "${label}"`)
        invalid++
      }
    }
    for (const title of scenario.skills) {
      if (!knownSkills.has(title)) {
        console.log(`WARN scenar "${scenario.label}": neznamy skill "${title}"`)
        invalid++
      }
    }
  }
  invalidScenarios = invalid
  if (invalid) {
    console.log(`\nNalezeno ${invalid} problemu ve scenarich. Neplatne volby se tise ignoruji, oprav je.\n`)
  }
}

if (validateOnly) {
  console.log(invalidScenarios ? `Validace: ${invalidScenarios} problemu.` : 'Validace: scenare jsou v poradku.')
  process.exit(invalidScenarios ? 1 : 0)
}

// ---------- dostupnost PowerShellu ----------
function resolveShell() {
  for (const exe of ['pwsh', 'powershell.exe', 'powershell']) {
    try {
      execFileSync(exe, ['-NoProfile', '-Command', 'exit 0'], { stdio: 'ignore' })
      return exe
    } catch {
      /* zkus dalsi */
    }
  }
  return null
}
const shell = resolveShell()
if (!shell) {
  console.error('PowerShell (pwsh/powershell) neni dostupny, paritni test nelze spustit.')
  process.exit(1)
}
console.log(`PowerShell: ${shell}`)

// ---------- spuštění všech scénářů ----------
let failed = 0
for (const [index, scenario] of scenarios.entries()) {
  console.log(`\n=== scénář ${index + 1}/${scenarios.length}: ${scenario.label} ===`)
  const workDir = path.join(root, 'scripts', `.parity${index + 1}`)
  fs.rmSync(workDir, { recursive: true, force: true })
  fs.mkdirSync(workDir, { recursive: true })
  const result = runScenario(scenario, workDir)
  console.log(`shoda: ${result.same}/${result.total}`)
  for (const d of result.diffs) {
    console.log(`\n--- ${d.kind}: ${d.rel}`)
    if (d.jsonDiff) {
      for (const line of d.jsonDiff.slice(0, 14)) console.log(`  ${line}`)
      if (d.jsonDiff.length > 14) console.log(`  … a dalších ${d.jsonDiff.length - 14} rozdílů`)
      continue
    }
    if (d.a !== undefined) {
      const la = d.a.split(/\r?\n/)
      const lb = d.b.split(/\r?\n/)
      let shown = 0
      for (let i = 0; i < Math.max(la.length, lb.length) && shown < 12; i++) {
        if (la[i] !== lb[i]) {
          console.log(`  řádek ${i + 1}`)
          console.log(`    PS: ${JSON.stringify(la[i] ?? null)}`)
          console.log(`    TS: ${JSON.stringify(lb[i] ?? null)}`)
          shown++
        }
      }
      if (shown === 0) console.log('  (jen rozdíl v koncových whitespace/odřádkování)')
    }
  }
  fs.writeFileSync(path.join(workDir, 'result.json'), JSON.stringify({ same: result.same, total: result.total, diffs: result.diffs.map((d) => ({ rel: d.rel, kind: d.kind })) }, null, 2))
  failed += result.diffs.length
}

console.log(`\ncelkově: ${failed === 0 ? 'všechny scénáře odpovídají PowerShell výstupu' : `${failed} rozdílů`}`)
process.exit(failed ? 1 : 0)

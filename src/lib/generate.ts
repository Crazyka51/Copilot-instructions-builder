// Generátor konfiguračních souborů - přepis PowerShell builderu do TypeScriptu.
import * as T from './templates'
import cardsData from '../data/cards.json'
import skillsData from '../data/skills.json'
import behaviorMapData from '../data/behaviorMap.json'
import type { Card, GeneratedFile, GenCtx, Options, Project, SkillEntry } from './types'

const cards = cardsData as Card[]
const skills = skillsData.skills as SkillEntry[]
const categorySteps = skillsData.categorySteps as Record<string, string[]>
const behaviorMap = behaviorMapData as Record<string, string>

/** card id for each PS `$vals` key */
export const VALS: Record<string, string> = {
  Arch: 'rArch',
  Render: 'rRender',
  Design: 'rDesign',
  ArchType: 'rArchType',
  Target: 'rTarget',
  Fe: 'rFe',
  Css: 'rCss',
  I18n: 'rI18n',
  State: 'rState',
  Forms: 'rForms',
  Animation: 'rAnimation',
  Be: 'rBe',
  DbStrategy: 'rDbStrategy',
  VercelDb: 'rVercelDb',
  Orm: 'rOrm',
  Fetch: 'rFetch',
  Realtime: 'rRealtime',
  Pooling: 'rPooling',
  Cache: 'rCache',
  ApiDesign: 'rApiDesign',
  Deploy: 'rDeploy',
  Iac: 'rIac',
  AuthType: 'rAuthType',
  Cms: 'rCms',
  CmsEditor: 'rCmsEditor',
  AdminShell: 'rAdminShell',
  Seo: 'rSeo',
  AbTesting: 'rAbTesting',
  Mobile: 'rMobile',
  MobileDeploy: 'rMobileDeploy',
  MobileNav: 'rMobileNav',
  MobileUi: 'rMobileUi',
  MobileState: 'rMobileState',
  MobileAuth: 'rMobileAuth',
  AppDomain: 'rAppDomain'
}

/** card id for each PS `$lists` key */
export const LISTS: Record<string, string> = {
  Lint: 'cLint',
  Test: 'cTest',
  Auth: 'cAuth',
  Sec: 'cSec',
  Log: 'cLog',
  Observability: 'cObservability',
  Compliance: 'cCompliance',
  Core: 'cCore',
  Admin: 'cAdmin',
  Ai: 'cAi',
  CiCd: 'cCiCd',
  VercelFeatures: 'cVercelFeatures',
  FeUi: 'cFeUi',
  MobileFeatures: 'cMobileFeatures',
  Ecommerce: 'cEcommerce',
  Booking: 'cBooking',
  Saas: 'cSaas',
  Lms: 'cLms',
  Crm: 'cCrm',
  Integrations: 'cIntegrations',
  Marketing: 'cMarketing',
  Legal: 'cLegal',
  BuildValidation: 'cBuildValidation',
  ProjectLayout: 'cProjectLayout',
  CodeStyleBehavior: 'cCodeStyle',
  TestingBehavior: 'cTestingBehavior',
  DocsBehavior: 'cDocsBehavior',
  SecurityBehavior: 'cSecurityBehavior',
  Accessibility: 'cAccessibility',
  Performance: 'cPerformance'
}

export const NOT_SPECIFIED = 'Nespecifikováno'
export const NOT_REQUIRED = '*(Není vyžadováno)*'

// ---------- helpers ----------

export function getSafeName(name: string): string {
  const cleaned = (name || '')
    // eslint-disable-next-line no-control-regex -- zamerne odstranuje ridici znaky z nazvu souboru
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/^_+|_+$/g, '')
  return cleaned || 'EnterpriseProject'
}

export function polish(text: string): string {
  return text.split(`${NOT_SPECIFIED} — ${NOT_SPECIFIED}`).join('neuvedeno').split(NOT_SPECIFIED).join('neuvedeno')
}

export function asSection(text: string): string {
  if (!text || !text.trim()) return ''
  return text.trim().replace(/^# /m, '## ')
}

export function stackPair(a: string, b: string): string {
  const aOk = !!a && a !== NOT_SPECIFIED
  const bOk = !!b && b !== NOT_SPECIFIED
  if (aOk && bOk) return `${a} + ${b}`
  if (aOk) return a
  if (bOk) return b
  return NOT_SPECIFIED
}

/** Mirror of PS `Get-Radio` - first checked option or "Nespecifikováno". */
export function getRadio(sel: Record<string, string[]>, cardId: string): string {
  const values = sel[cardId]
  return values && values.length ? values[0] : NOT_SPECIFIED
}

/** Mirror of PS `Get-List` - bullet list or "*(Není vyžadováno)*". */
export function getList(sel: Record<string, string[]>, cardId: string): string {
  const values = sel[cardId] ?? []
  const order = cards.find((c) => c.id === cardId)?.options ?? []
  const picked = order.filter((o) => values.includes(o))
  if (!picked.length) return NOT_REQUIRED
  return picked.map((v) => `- ${v}`).join('\n')
}

export function behaviorBullets(rawList: string): string {
  if (rawList.includes('Není vyžadováno')) return rawList
  return rawList
    .split('\n')
    .map((line) => {
      const label = line.replace(/^- /, '')
      const mapped = behaviorMap[label]
      return mapped ? `- ${mapped}` : line
    })
    .join('\n')
}

export function getRoleName(domain: string): string {
  if (/E-shop/.test(domain)) return 'Full Stack E-commerce Developer'
  if (/Marketplace/.test(domain)) return 'Full Stack Marketplace Developer'
  if (/SaaS/.test(domain)) return 'Full Stack SaaS Developer'
  if (/Rezerva|Booking/.test(domain)) return 'Full Stack Developer pro rezervační systémy'
  if (/LMS/.test(domain)) return 'Full Stack EdTech Developer'
  if (/CRM/.test(domain)) return 'Full Stack Developer pro interní nástroje'
  if (/Blog|Magazín/.test(domain)) return 'Full Stack Web Developer se zaměřením na obsah a SEO'
  if (/Portfolio/.test(domain)) return 'Full Stack Developer pro prezentační web'
  if (/Sociální/.test(domain)) return 'Full Stack Developer pro komunitní platformy'
  return 'Full Stack Developer'
}

// ---------- derived values ----------

export interface Values {
  v: Record<string, string>
  lists: Record<string, string>
  p: string
  slug: string
  usePnpm: boolean
  mobileChosen: boolean
  hasSpecialized: boolean
  hasValidation: boolean
  dbIsNeon: boolean
  dbIsSupabase: boolean
}

export function buildValues(project: Project): Values {
  const sel = project.selection
  const v: Record<string, string> = {}
  for (const [key, cardId] of Object.entries(VALS)) v[key] = getRadio(sel, cardId)
  const lists: Record<string, string> = {}
  for (const [key, cardId] of Object.entries(LISTS)) lists[key] = getList(sel, cardId)

  const p = getSafeName(project.name)
  return {
    v,
    lists,
    p,
    slug: p.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'projekt',
    usePnpm: /pnpm|Turborepo|Nx/.test(v.Arch),
    mobileChosen: /React Native|Flutter|Capacitor/.test(v.Mobile),
    hasSpecialized: [lists.Ecommerce, lists.Booking, lists.Saas, lists.Lms, lists.Crm].some((x) => !x.includes('Není vyžadováno')),
    hasValidation: /Zod/.test(v.Forms),
    dbIsNeon: /Neon/.test(v.DbStrategy),
    dbIsSupabase: /Supabase/.test(v.DbStrategy)
  }
}

function buildSections(x: Values): Pick<GenCtx, 'neonSection' | 'supabaseSection' | 'mobileSection' | 'tipTapSection' | 'vercelSection' | 'specializedSection' | 'legalSection' | 'domainPersona'> {
  const { v, lists, mobileChosen, hasSpecialized } = x
  const ctxShell = { v, lists, p: x.p, slug: x.slug } as GenCtx

  const neonSection = /Neon/.test(v.DbStrategy) ? T.neonSectionTpl(ctxShell) : ''
  const supabaseSection = /Supabase/.test(v.DbStrategy) ? T.supabaseSectionTpl(ctxShell) : ''
  const mobileSection = mobileChosen ? T.mobileSectionTpl(ctxShell) : ''
  const tipTapSection = /TipTap/.test(v.CmsEditor) ? T.tipTapSectionTpl(ctxShell) : ''
  const vercelSection = /Vercel/.test(v.Deploy) ? T.vercelSectionTpl(ctxShell) : ''
  const specializedSection = hasSpecialized || !/Obecná|Portfolio/.test(v.AppDomain) ? T.specializedSectionTpl(ctxShell) : ''
  const legalSection = !lists.Legal.includes('Není vyžadováno') ? T.legalSectionTpl(ctxShell) : ''

  let domainPersona = ''
  if (/E-shop|Marketplace/.test(v.AppDomain)) domainPersona += T.domainPersonaEshop(ctxShell)
  if (/Rezerva|Booking/.test(v.AppDomain)) domainPersona += T.domainPersonaBooking(ctxShell)
  if (/SaaS/.test(v.AppDomain)) domainPersona += T.domainPersonaSaaS(ctxShell)
  if (/LMS/.test(v.AppDomain)) domainPersona += T.domainPersonaLMS(ctxShell)
  if (!lists.Crm.includes('Není vyžadováno')) domainPersona += T.domainPersonaCRM(ctxShell)

  return { neonSection, supabaseSection, mobileSection, tipTapSection, vercelSection, specializedSection, legalSection, domainPersona }
}

function buildCtx(x: Values, options: Options): GenCtx {
  const sections = buildSections(x)
  const commands = packageCommands(x.usePnpm)
  const stackLines = [
    `* **Doména:** ${x.v.AppDomain}`,
    `* **Architektura:** ${x.v.Arch} — ${x.v.ArchType}`,
    `* **Rendering:** ${x.v.Render}`,
    `* **Frontend:** ${stackPair(x.v.Fe, x.v.Css)}`,
    `* **Backend:** ${x.v.Be}`,
    `* **Databáze:** ${x.v.DbStrategy} + ${x.v.Orm}`,
    `* **Autentizace:** ${x.v.AuthType}`,
    `* **Nasazení:** ${x.v.Deploy}`
  ]
  if (x.mobileChosen) stackLines.push(`* **Mobil:** ${x.v.Mobile} (${x.v.MobileNav}, ${x.v.MobileState})`)

  return {
    v: x.v,
    lists: x.lists,
    p: x.p,
    slug: x.slug,
    modeExtended: options.format === 'extended',
    sk: { category: '', slug: '', title: '', description: '', checklist: [] },
    ...sections,
    usePnpm: x.usePnpm,
    hasValidation: x.hasValidation,
    stackLines,
    fence: '```',
    goalText: '',
    role: '',
    taskBody: '',
    cmdInstall: commands.install,
    cmdDev: commands.dev,
    cmdBuild: commands.build,
    cmdTest: commands.test,
    cmdLint: commands.lint,
    cmdTypecheck: commands.typecheck,
    asSection,
    behaviorBullets,
    stackPair
  }
}

/** Package-manager commands as the PowerShell builder composes them. */
export function packageCommands(usePnpm: boolean) {
  return usePnpm
    ? { install: 'pnpm install', dev: 'pnpm dev', build: 'pnpm build', test: 'pnpm test', lint: 'pnpm lint', typecheck: 'pnpm typecheck' }
    : { install: 'npm install', dev: 'npm run dev', build: 'npm run build', test: 'npm test', lint: 'npm run lint', typecheck: 'npm run typecheck' }
}

// ---------- skills ----------

export function selectSkills(project: Project, options: Options): SkillEntry[] {
  if (options.skillScope === 'none') return []
  if (options.skillScope === 'all') return skills
  const checked = (project.selection['skillGroups'] ?? []) as string[]
  return skills.filter((s) => checked.includes(s.title))
}

/** Mirror of PS `Get-SkillBlock`. */
export function skillBlock(sk: SkillEntry, level: number, options: Options): string {
  const h = '#'.repeat(level)
  const parts: string[] = [`${h} ${sk.title}`, '', sk.description, '', `${h}# Postup`]
  for (const step of categorySteps[sk.category] ?? []) parts.push(`- ${step}`)
  if (options.skillChecklist) {
    parts.push('', `${h}# Kontrolní seznam`)
    for (const item of sk.checklist) parts.push(`- [ ] ${item}`)
  }
  if (options.skillExample) {
    parts.push(
      '',
      `${h}# Příklad použití`,
      '',
      '```',
      `Uživatel: Potřebuji aplikovat: ${sk.title}.`,
      'Agent: Projde Postup, ověří Kontrolní seznam a teprve pak upraví kód.',
      '```'
    )
  }
  if (options.skillRelated) {
    parts.push(
      '',
      `${h}# Související soubory`,
      '- `.github/copilot-instructions.md`',
      '- `AGENTS.md`',
      '- `.github/workflows/copilot-setup-steps.yml`'
    )
  }
  return parts.join('\n')
}

function skillsSummaryTable(selected: SkillEntry[]): string {
  const rows = ['| Skill | Kategorie | Zaměření |', '|-------|-----------|----------|']
  for (const s of selected) rows.push(`| \`${s.slug}\` | ${s.category} | ${s.title} |`)
  return rows.join('\n')
}

function buildSkillsSection(selected: SkillEntry[], options: Options): string {
  if (!selected.length) return '## Skills\n\n*(Nejsou vybrány žádné skills.)*'
  const table = skillsSummaryTable(selected)
  if (options.format === 'extended') {
    return (
      '## Skills\n\n' +
      'Podrobné postupy jsou v `.github/skills/SKILL.md`. Načti je, když úloha odpovídá některému ze skillů.\n\n' +
      (options.skillSummary ? `### Přehled\n\n${table}\n` : '')
    )
  }
  const out: string[] = ['## Skills', '', 'Následující postupy použij, když úloha odpovídá některému ze skillů.', '']
  if (options.skillSummary) {
    out.push(table, '')
  }
  for (const sk of selected) {
    out.push(skillBlock(sk, 3, options), '')
  }
  return out.join('\n')
}

// ---------- optional sections ----------

export function repoStructure(x: Values, cardCtx: GenCtx): string {
  const isMonorepo = /monorepo|workspaces|Turborepo|Nx/.test(x.v.Arch)
  const isNext = /Next\.js/.test(x.v.Fe)
  const isVue = /Vue|Nuxt/.test(x.v.Fe)
  let tree: string
  if (isMonorepo) tree = T.repoTreeMonorepo(cardCtx)
  else if (isNext) tree = T.repoTreeNext(cardCtx)
  else if (isVue) tree = T.repoTreeVue(cardCtx)
  else tree = T.repoTreeGeneric(cardCtx)
  tree = tree.replace(/\n+$/, '')
  return (
    '## Struktura repozitáře\n' +
    '\nUspořádej kód takto. Nové soubory umísťuj na místo, které odpovídá jejich odpovědnosti.\n' +
    '\n' + tree + '\n' +
    '\n**Pravidla pro umístění:**\n' +
    '- Komponenta, která se používá na více místech, patří do `components/ui` nebo `components`.\n' +
    '- Přímý přístup k databázi nikdy nepatří do komponenty - použij vrstvu služeb nebo akci.\n' +
    '- Validační schéma patří do `schemas` a používá se na klientu i serveru.\n'
  )
}

export function antiPatterns(cardCtx: GenCtx): string {
  const blocks = [
    T.antiPattern1(cardCtx),
    T.antiPattern2(cardCtx),
    T.antiPattern3(cardCtx),
    T.antiPattern4(cardCtx),
    T.antiPattern5(cardCtx),
    T.antiPattern6(cardCtx)
  ].map((b) => b.replace(/^\n+/, '').replace(/\n+$/, ''))
  return (
    '## Anti-patterns: co nikdy nedělat\n\nToto jsou zakázané vzory. Když je v kódu najdeš, oprav je.\n\n' +
    blocks.join('\n')
  )
}

export function reviewChecklist(x: Values): string {
  const items = [
    'Kód řeší zadání a nic víc.',
    'Nejsou přidány nedeklarované závislosti.',
    'Veškerý vstup je validován na serveru.',
    'Oprávnění se ověřuje na serveru, ne podle údaje z klienta.',
    'V kódu ani v konfiguraci nejsou tajemství.',
    'Chyby se logují a nevracejí se interní detaily.',
    'Texty nejsou napevno v komponentách.',
    'Nové chování pokrývá test.',
    'Testy procházejí a lint i typová kontrola jsou zelené.',
    'Nejsou provedeny nesouvisející změny.',
    'Zmíněny dopady a případná migrace.',
    'Struktura souborů odpovídá konvenci projektu.'
  ]
  if (!x.lists.Legal.includes('Není vyžadováno')) items.push('Zmíněny dopady na osobní údaje a jejich retenci.')
  if (!x.lists.Integrations.includes('Není vyžadováno')) items.push('Webhooky a externí volání jsou idempotentní.')
  return ['## Kontrolní seznam pro code review', '', 'Projdi tyto body u každé změny před mergem.', '', ...items.map((i) => `- [ ] ${i}`)].join('\n')
}

/** Mirror of PS `Get-TaskSection` - empty when no items are selected. */
export function taskSection(title: string, values: string[]): string {
  const parts = values
    .flatMap((raw) => raw.split('\n'))
    .filter((line) => line && !line.includes('Není vyžadováno'))
  if (!parts.length) return ''
  return `### ${title}\n\n${parts.join('\n')}`
}

export function taskBody(x: Values): string {
  const l = x.lists
  const sections = [
    taskSection('Doménové funkce', [l.Ecommerce, l.Booking, l.Saas, l.Lms, l.Crm]),
    taskSection('Aplikace, správa a obsah', [l.Admin, l.Core, l.Ai]),
    taskSection('Externí integrace', [l.Integrations]),
    taskSection('Marketing a růst', [l.Marketing]),
    taskSection('Právo, soukromí a soulad', [l.Legal, l.Compliance]),
    taskSection('Kvalita, testování a provoz', [l.Test, l.CiCd, l.Observability, l.Log, l.VercelFeatures]),
    taskSection('Autentizace, role a zabezpečení', [l.Auth, l.Sec]),
    taskSection('Frontend a UX', [l.FeUi]),
    x.mobileChosen ? taskSection('Mobilní aplikace', [l.MobileFeatures]) : '',
    taskSection('Chování při práci s kódem', [
      l.BuildValidation,
      l.ProjectLayout,
      l.CodeStyleBehavior,
      l.TestingBehavior,
      l.DocsBehavior,
      l.SecurityBehavior,
      l.Accessibility,
      l.Performance
    ])
  ]
  return sections.filter((s) => s !== '').join('\n\n')
}

// ---------- root context ----------

const UNSPECIFIED_NOTE = '> Hodnoty označené `neuvedeno` nebyly při generování vybrány. Doplň je podle kontextu, nebo se na ně zeptej - nedomýšlej si je.'

function buildRootOverview(x: Values, options: Options, ctx: GenCtx, selected: SkillEntry[]): string {
  const skillsSection = buildSkillsSection(selected, options)
  const agentTask = T.agentTaskSectionTpl(ctx)
  const extra: string[] = []
  const push = (text: string) => extra.push(text.replace(/\n+$/, ''))
  if (options.taskPromptInDoc) push(getTaskPrompt(x, ctx, selected))
  if (options.repoStructure) push(repoStructure(x, ctx))
  if (options.workflow) push(T.workflowExamplesTpl(ctx))
  if (options.antiPatterns) push(antiPatterns(ctx))
  if (options.reviewChecklist) push(reviewChecklist(x))

  const parts: string[] = []
  parts.push(`# Copilot Instructions: ${x.p}`)
  parts.push('')
  parts.push('Tento soubor je vždy aktivní repozitářový kontext pro GitHub Copilot (Chat, Coding Agent, PR review).')
  parts.push('')
  parts.push('## Project Overview')
  parts.push(`* **Repozitář / architektura:** ${x.v.Arch} — ${x.v.ArchType}`)
  parts.push(`* **Rendering strategie:** ${x.v.Render}`)
  parts.push(`* **Cílové platformy:** ${x.v.Target}`)
  parts.push(`* **Design systém a vibe:** ${x.v.Design}`)
  parts.push(`* **Frontend:** ${stackPair(x.v.Fe, x.v.Css)}`)
  parts.push(`* **Backend:** ${x.v.Be}`)
  parts.push(`* **Databáze:** ${x.v.DbStrategy}`)
  parts.push(`* **Doména:** ${x.v.AppDomain}`)
  parts.push(`* **Nasazení:** ${x.v.Deploy}`)
  parts.push('')
  parts.push(UNSPECIFIED_NOTE)
  parts.push('')
  parts.push('---')
  parts.push('')
  parts.push(asSection(T.instrukceTpl(ctx)))
  parts.push('')
  parts.push('---')
  parts.push('')
  parts.push(asSection(T.personaTpl(ctx)))
  parts.push('')
  parts.push('---')
  parts.push('')
  parts.push(asSection(T.dbDocTpl(ctx)))
  parts.push('')
  parts.push('---')
  parts.push('')
  parts.push(asSection(T.behaviorDocTpl(ctx)))
  if (x.hasSpecialized || !/Obecná|Portfolio/.test(x.v.AppDomain)) {
    parts.push('')
    parts.push('---')
    parts.push('')
    parts.push(asSection(T.specializationDocTpl(ctx)))
  }
  if (ctx.mobileSection) {
    parts.push('')
    parts.push('---')
    parts.push('')
    parts.push(asSection(ctx.mobileSection))
  }
  parts.push('')
  parts.push('---')
  parts.push('')
  parts.push(skillsSection)
  parts.push('')
  parts.push('---')
  parts.push('')
  parts.push(agentTask)
  if (extra.length) {
    parts.push('')
    parts.push('---')
    parts.push('')
    parts.push(extra.join('\n\n---\n\n'))
  }
  parts.push('')
  parts.push('')
  parts.push('---')
  parts.push('')
  parts.push('## References')
  parts.push('* `.github/copilot-instructions.md` — tento soubor')
  if (options.format === 'extended') parts.push('* `.github/skills/SKILL.md` — postupy a kontrolní seznamy')
  parts.push('* `AGENTS.md` — instrukce pro ostatní AI agenty')
  parts.push('* `.github/workflows/copilot-setup-steps.yml` — prostředí pro coding agenta')
  if (options.taskPromptFile) parts.push('* `.github/prompts/agent-task.prompt.md` — úkolový prompt ke vložení do chatu')
  if (options.format === 'extended') parts.push('* `.github/agents/agent-task.agent.md` — definice agenta pro plnění úloh')
  return parts.join('\n') + '\n'
}

/** Mirror of PS `Get-TaskPrompt`. */
export function getTaskPrompt(_x: Values, ctx: GenCtx, _selected: SkillEntry[]): string {
  return T.taskPromptTpl(ctx)
}

// ---------- skill.md / agent-task ----------

export function buildSkillMd(x: Values, options: Options, selected: SkillEntry[]): string {
  const head = [
    '---',
    `name: ${x.slug}-skills`,
    `description: Postupy a kontrolní seznamy pro projekt ${x.p}. Načti příslušný skill, když úloha odpovídá jeho zaměření.`
  ]
  if (options.skillMetadata) {
    head.push('metadata:')
    head.push(`  projekt: ${x.p}`)
    head.push(`  architektura: ${x.v.Arch}`)
    head.push(`  skills: ${selected.length}`)
  }
  head.push('---')
  const body: string[] = ['', `# Skills: ${x.p}`, '', `Soubor obsahuje ${selected.length} postupů. Každý skill má své zaměření, postup a kontrolní seznam.`, '']
  if (options.skillSummary) {
    body.push('## Přehled', '', skillsSummaryTable(selected), '')
  }
  for (const sk of selected) {
    body.push(skillBlock(sk, 2, options), '')
  }
  return head.join('\n') + '\n' + body.join('\n').replace(/\s+$/, '') + '\n'
}

// ---------- project files ----------

function goalText(project: Project): string {
  const g = (project.goal ?? '').trim()
  return g || 'Cíl projektu nebyl slovně upřesněn.'
}

function specText(project: Project): string {
  const s = project.spec
  const creates = s.creates.trim() || 'neuvedeno'
  const audience = s.audience.trim() || 'neuvedeno'
  const functions = s.functions.trim() || 'podle vybraných modulů'
  const files = s.files.trim() || 'podle implementačního plánu'
  const deps = s.forbiddenDependencies.trim() || 'nepřidávat balíčky bez odůvodnění a schválení'
  return (
    '## Zadání pro agenta\n' +
    `- Co vytváří: ${creates}\n` +
    `- Pro koho: ${audience}\n` +
    '- Technologie: Next.js (App Router), React, TypeScript a schválený Node.js ekosystém.\n' +
    `- Funkce k implementaci: ${functions}\n` +
    `- Soubory k vytvoření: ${files}\n` +
    `- Zakázané zbytečné závislosti: ${deps}\n` +
    '- Ověření dokončení: testy, typová kontrola, lint, build a kontrola splnění tohoto plánu.\n\n'
  )
}

export function buildProjectPlan(project: Project, x: Values): string {
  const bullets: string[] = []
  bullets.push('### Fáze 1: Základy')
  for (const b of [
    '- [ ] Nastavit repozitář, závislosti a CI',
    '- [ ] Připravit datové schéma a migrace',
    `- [ ] Zprovoznit autentizaci (${x.v.AuthType})`,
    '- [ ] Vytvořit základní layout a navigaci'
  ]) bullets.push(b)
  if (!x.lists.Admin.includes('Není vyžadováno')) {
    bullets.push('', '### Fáze 2: Administrace')
    for (const b of ['- [ ] Dashboard s přehledem', '- [ ] Správa uživatelů a rolí', '- [ ] Auditní log']) bullets.push(b)
  }
  // PowerShell porovnává zřetězený řetězec všech seznamů, takže fáze 3 se zobrazí,
  // jen když je vybrán alespoň jeden modul v každé z pěti skupin. Chováme se stejně.
  const domainConcat = [x.lists.Ecommerce, x.lists.Booking, x.lists.Saas, x.lists.Lms, x.lists.Crm].join('')
  if (!domainConcat.includes('Není vyžadováno')) {
    bullets.push('', '### Fáze 3: Doménové funkce')
    for (const b of ['- [ ] Doménové funkce podle specifikace', '- [ ] Napojení plateb a notifikací', '- [ ] Testy kritických toků']) bullets.push(b)
  }
  bullets.push('', '### Fáze 4: Provoz a kvalita')
  for (const b of ['- [ ] Observabilita a alerty', '- [ ] SEO, přístupnost a výkon', '- [ ] Zálohy a obnova', '- [ ] Dokumentace a onboarding']) bullets.push(b)

  return (
    `# Plán projektu: ${x.p}\n\n## Cíl projektu\n${goalText(project)}\n\n` +
    `Doména: **${x.v.AppDomain}**\n\nCílová platforma: **${x.v.Target}**\n\n` +
    `Stack: Next.js (App Router), React, TypeScript, ${x.v.Be}, ${x.v.DbStrategy}\n\n` +
    specText(project) +
    '\nFáze uprav podle skutečných priorit.\n\n' +
    bullets.join('\n') +
    '\n'
  )
}

export function buildProjectConfig(project: Project, x: Values) {
  return {
    schemaVersion: 1,
    project: { name: x.p, goal: goalText(project), domain: x.v.AppDomain, target: x.v.Target },
    stack: {
      frontend: x.v.Fe,
      css: x.v.Css,
      backend: x.v.Be,
      database: x.v.DbStrategy,
      orm: x.v.Orm,
      auth: x.v.AuthType,
      deployment: x.v.Deploy
    },
    modules: {
      ecommerce: x.lists.Ecommerce,
      booking: x.lists.Booking,
      admin: x.lists.Admin,
      integrations: x.lists.Integrations,
      security: x.lists.Sec,
      testing: x.lists.Test
    },
    generatedContext: [
      'PROJECT_PLAN.md',
      'project.config.json',
      'README.md',
      '.env.example',
      '.github/copilot-instructions.md',
      'AGENTS.md',
      '.agentic/manifest.json'
    ]
  }
}

export function buildManifest(project: Project, x: Values) {
  const s = project.spec
  return {
    project: {
      name: x.p,
      goal: goalText(project),
      domain: x.v.AppDomain,
      target: x.v.Target,
      architecture: `${x.v.Arch} - ${x.v.ArchType}`
    },
    specification: {
      creates: s.creates.trim() || 'neuvedeno',
      audience: s.audience.trim() || 'neuvedeno',
      technologies: 'Next.js (App Router), React, TypeScript, Node.js ekosystém',
      functions: s.functions.trim() || 'podle vybraných modulů',
      files: s.files.trim() || 'podle implementačního plánu',
      forbiddenDependencies: s.forbiddenDependencies.trim() || 'nepřidávat balíčky bez odůvodnění a schválení',
      doneWhen: [
        'Testy procházejí',
        'Typová kontrola prochází',
        'Lint prochází',
        'Produkční build prochází',
        'Implementace odpovídá PROJECT_PLAN.md'
      ]
    },
    tech_stack: {
      frontend: `${x.v.Fe} + ${x.v.Css}`,
      backend: x.v.Be,
      database: `${x.v.DbStrategy} + ${x.v.Orm}`,
      auth: x.v.AuthType,
      deployment: x.v.Deploy
    },
    agent_rules: {
      hard_rules: [
        'Striktni typy, zadne any',
        'Zadny napevno zadany text v komponentach',
        'Tajemstvi pouze v prostredi, nikdy v kodu',
        'Kazda nova funkce ma test'
      ],
      workflow: ['Precti instrukce', 'Prozkoumej kod', 'Nejmensi funkcni zmena', 'Testy', 'Lint a typova kontrola', 'Shrnuti a dopady']
    },
    constraints: {
      never_modify_structure: true,
      never_add_undeclared_dependencies: true,
      never_commit_secrets: true
    },
    links: {
      instructions: '.github/copilot-instructions.md',
      agents: 'AGENTS.md',
      setup: '.github/workflows/copilot-setup-steps.yml',
      project_plan: 'PROJECT_PLAN.md'
    }
  }
}

// ---------- main entry ----------

/** Mirror of PS `Write-MergedFile` for a fresh file - wraps content in markers. */
function wrap(content: string, isYaml: boolean): string {
  const s = isYaml ? '# copilot-builder:start' : '<!-- copilot-builder:start -->'
  const e = isYaml ? '# copilot-builder:end' : '<!-- copilot-builder:end -->'
  return `${s}\n${content.replace(/\s+$/, '')}\n${e}\n`
}

export function generate(project: Project, options: Options): GeneratedFile[] {
  const x = buildValues(project)
  const ctx = buildCtx(x, options)
  ctx.goalText = goalText(project)
  ctx.role = getRoleName(x.v.AppDomain)
  ctx.taskBody = taskBody(x)
  const selected = selectSkills(project, options)
  const files: GeneratedFile[] = []

  // 1. Copilot instructions
  files.push({
    path: '.github/copilot-instructions.md',
    content: wrap(polish(buildRootOverview(x, options, ctx, selected)), false),
    language: 'markdown'
  })

  // 2. AGENTS.md
  if (options.format !== 'instructions') {
    files.push({ path: 'AGENTS.md', content: wrap(polish(T.agentsMdTpl(ctx)), false), language: 'markdown' })
  }

  // 3. copilot setup steps
  if (options.format !== 'instructions') {
    files.push({ path: '.github/workflows/copilot-setup-steps.yml', content: wrap(polish(setupSteps(x, ctx)), true), language: 'yaml' })
  }

  // 4. + 5. extended format
  if (options.format === 'extended') {
    if (selected.length) {
      files.push({ path: '.github/skills/SKILL.md', content: wrap(polish(buildSkillMd(x, options, selected)), false), language: 'markdown' })
    }
    files.push({ path: '.github/agents/agent-task.agent.md', content: wrap(polish(T.agentTaskMdTpl(ctx)), false), language: 'markdown' })
  }

  // standalone task prompt
  if (options.taskPromptFile) {
    const fm = ['---', 'mode: agent', `description: 'Úkolový prompt pro projekt ${x.p} - role ${getRoleName(x.v.AppDomain)}'`, '---', ''].join('\n')
    files.push({
      path: `.github/prompts/${x.slug}.prompt.md`,
      content: wrap(polish(fm + getTaskPrompt(x, ctx, selected)), false),
      language: 'markdown'
    })
  }

  // project bootstrap
  if (options.projectPlan) {
    files.push({ path: 'PROJECT_PLAN.md', content: wrap(polish(buildProjectPlan(project, x)), false), language: 'markdown' })
  }
  files.push({ path: 'project.config.json', content: JSON.stringify(buildProjectConfig(project, x), null, 2), language: 'json' })
  files.push({ path: 'README.md', content: wrap(polish(T.readmeTpl(ctx)), false), language: 'markdown' })
  files.push({ path: '.env.example', content: wrap(polish(T.envExampleTpl(ctx)), true), language: 'yaml' })
  if (options.contributing) {
    files.push({ path: 'CONTRIBUTING.md', content: wrap(polish(T.contribTpl(ctx)), false), language: 'markdown' })
  }
  if (options.manifest) {
    files.push({ path: '.agentic/manifest.json', content: JSON.stringify(buildManifest(project, x), null, 6), language: 'json' })
  }

  return files
}

function setupSteps(x: Values, ctx: GenCtx): string {
  const be = x.v.Be
  let body: string
  if (/Python/.test(be)) body = T.setupPythonTpl(ctx)
  else if (/Go \(/.test(be)) body = T.setupGoTpl(ctx)
  else if (/Rust/.test(be)) body = T.setupRustTpl(ctx)
  else if (/Hono|Edge Functions/.test(be)) body = T.setupEdgeTpl(ctx)
  else body = T.setupNodeTpl(ctx)
  return T.setupHeaderTpl(ctx).replace(/\s+$/, '') + '\n' + body
}

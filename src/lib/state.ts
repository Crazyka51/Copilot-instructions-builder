// Stav voleb, aplikace presetů a ukládání/načítání konfigurace.
import cardsData from '../data/cards.json'
import presetsData from '../data/presets.json'
import skillsData from '../data/skills.json'
import type { Card, Options, OutputFormat, PresetEntry, PresetTrigger, Selection, SkillEntry } from './types'
import { defaultOptions } from './types'

export const cards = cardsData as Card[]
export const skills = skillsData.skills as SkillEntry[]
export const presetMap = presetsData.presets as Record<string, PresetEntry[]>
export const triggerOf = presetsData.triggerOf as Record<string, PresetTrigger>
export const groupsByKind = presetsData.groupsByKind as Record<string, string[]>

export const cardById = new Map(cards.map((c) => [c.id, c]))

export function emptySelection(): Selection {
  const sel: Selection = {}
  for (const c of cards) sel[c.id] = []
  sel['skillGroups'] = []
  return sel
}

/**
 * Vyčistí výběr načtený z úložiště nebo konfigurace: zahodí neznámé karty,
 * neplatné volby a u radio karet ponechá nejvýše jednu hodnotu.
 */
export function sanitizeSelection(input: Selection | undefined | null): Selection {
  const out = emptySelection()
  if (!input) return out
  for (const card of cards) {
    if (card.dynamic) continue
    const values = input[card.id]
    if (!Array.isArray(values)) continue
    const allowed = card.options.filter((o) => values.includes(o))
    out[card.id] = card.kind === 'radio' ? allowed.slice(0, 1) : allowed
  }
  const known = new Set(skills.map((s) => s.title))
  out['skillGroups'] = (input['skillGroups'] ?? []).filter((t) => known.has(t))
  return out
}

export function countCheckedInTab(selection: Selection, tab: string): number {
  let n = 0
  for (const c of cards) {
    if (c.tab !== tab) continue
    n += (selection[c.id] ?? []).length
  }
  return n
}

/** Toggle an option; radio cards keep at most one selection. */
export function toggleOption(selection: Selection, cardId: string, option: string): Selection {
  const card = cardById.get(cardId)
  const current = selection[cardId] ?? []
  let next: string[]
  if (card?.kind === 'radio') {
    next = current.includes(option) ? [] : [option]
  } else {
    next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option]
  }
  return { ...selection, [cardId]: next }
}

export function setRadioValue(selection: Selection, cardId: string, option: string | null): Selection {
  return { ...selection, [cardId]: option ? [option] : [] }
}

/**
 * Apply a preset. Mirrors the PowerShell logic: entries are additive, radio
 * groups touched by the preset are cleared first, and with clearBeforePreset
 * also every group belonging to the same preset kind.
 */
export function applyPreset(selection: Selection, label: string, clearBefore: boolean): { selection: Selection; added: number } {
  const entries = presetMap[label]
  if (!entries) return { selection, added: 0 }
  const next: Selection = { ...selection }
  const kind = triggerOf[label]?.kind ?? 'other'

  if (clearBefore) {
    for (const cardId of groupsByKind[kind] ?? []) next[cardId] = []
  }

  for (const entry of entries) {
    const card = cardById.get(entry.card)
    if (!card) continue
    const previous = next[entry.card] ?? []
    const wanted = card.options.filter((option) => entry.items.includes(option))
    if (card.kind === 'radio') {
      // Radio karta drzi nejvyse jednu hodnotu a posledni shoda vyhrava (jako v PowerShellu).
      const target = wanted[wanted.length - 1]
      if (target) next[entry.card] = [target]
      continue
    }
    const values = [...previous]
    for (const item of wanted) if (!values.includes(item)) values.push(item)
    next[entry.card] = values
  }

  // Pocet nových voleb merime vuci vstupnimu vyberu. Radio karty se uvnitr presetu
  // mohou prebit, takze prubezny soucet by opakovane aplikovani nenuloval.
  let added = 0
  for (const cardId of new Set(entries.map((entry) => entry.card))) {
    const before = selection[cardId] ?? []
    added += (next[cardId] ?? []).filter((value) => !before.includes(value)).length
  }
  return { selection: next, added }
}

/**
 * Vybere hodnotu v radio karte, ktera preset spousti (doména, framework, platforma, cíl),
 * a zaroven aplikuje preset. Samotne presety tyto karty neobsahuji, proto je nastavujeme zvlášť.
 */
export function applyPresetWithTrigger(
  selection: Selection,
  label: string,
  fallbackCardId: string,
  clearBefore: boolean
): { selection: Selection; added: number } {
  const targetCardId = triggerOf[label]?.card ?? fallbackCardId
  const targetCard = targetCardId ? cardById.get(targetCardId) : undefined
  const applied = applyPreset(selection, label, clearBefore)

  if (!targetCard || !targetCard.options.includes(label)) return applied

  const alreadyChosen = (selection[targetCard.id] ?? []).includes(label)
  return {
    selection: { ...applied.selection, [targetCard.id]: [label] },
    added: applied.added + (alreadyChosen ? 0 : 1)
  }
}

// ---------- konfigurace ----------

export interface Config {
  version: number
  project: string
  goal: string
  spec: Record<string, string>
  options: Options
  cards: Record<string, string[]>
  skills: string[]
}

/** "tab|title" key used in the PowerShell config format. */
export function configKey(card: Card): string {
  return `${card.tab}|${card.title}`
}

export function toConfig(projectName: string, goal: string, spec: Record<string, string>, options: Options, selection: Selection): Config {
  const configCards: Record<string, string[]> = {}
  for (const card of cards) {
    if (card.dynamic) continue
    configCards[configKey(card)] = selection[card.id] ?? []
  }
  // skills jsou v PowerShell verzi karty podle kategorií ("Skills|<kategorie>")
  const checkedSkills = selection['skillGroups'] ?? []
  for (const category of [...new Set(skills.map((s) => s.category))]) {
    const titles = skills.filter((s) => s.category === category && checkedSkills.includes(s.title)).map((s) => s.title)
    configCards[`Skills|${category}`] = titles
  }
  return {
    version: 1,
    project: projectName,
    goal,
    spec,
    options,
    cards: configCards,
    skills: checkedSkills
  }
}

export function fromConfig(config: Config): Selection {
  const selection = emptySelection()
  const byKey = new Map(cards.map((c) => [configKey(c), c]))
  const skillTitles = new Set<string>()
  for (const [key, values] of Object.entries(config.cards ?? {})) {
    // Pozor: klice karet v zalozce Skills zacinaji na "Skills|" stejne jako klice
    // kategorii skills. Nejdřív proto zkusime kartu, teprve pak kategorii.
    const card = byKey.get(key)
    if (card) {
      selection[card.id] = (values ?? []).filter((v) => card.options.includes(v))
      continue
    }
    if (key.startsWith('Skills|')) {
      for (const v of values ?? []) if (skills.some((s) => s.title === v)) skillTitles.add(v)
    }
  }
  selection['skillGroups'] = config.skills?.length
    ? config.skills.filter((t) => skills.some((s) => s.title === t))
    : [...skillTitles]
  return selection
}

/** Odvodí volby výstupu z výběru karet - stejná logika jako v UI i v paritním testu. */
export function optionsFromSelection(sel: Selection): Options {
  const base = defaultOptions()
  const has = (cardId: string, option: string) => (sel[cardId] ?? []).includes(option)
  const radio = (cardId: string) => sel[cardId]?.[0] ?? ''
  return {
    ...base,
    format: formatFromLabel(radio('rSkillOutput')),
    skillScope: /Všechny/.test(radio('rSkillScope')) ? 'all' : /Bez skills/.test(radio('rSkillScope')) ? 'none' : 'selected',
    skillChecklist: has('cSkillContent', 'Kontrolní seznam (checklist)'),
    skillExample: has('cSkillContent', 'Příklad použití'),
    skillRelated: has('cSkillContent', 'Odkazy na související soubory'),
    skillMetadata: has('cSkillFrontMatter', 'Frontmatter s metadaty'),
    skillSummary: has('cSkillFrontMatter', 'Souhrnná tabulka skills'),
    taskPromptInDoc: has('cSkillFrontMatter', 'Úkolový prompt v instrukcích'),
    taskPromptFile: has('cSkillFrontMatter', 'Úkolový prompt jako samostatný soubor'),
    repoStructure: has('cProjectDocs', 'Struktura repozitáře'),
    workflow: has('cProjectDocs', 'Workflow příklady (formulář, API, komponenta)'),
    antiPatterns: has('cProjectDocs', 'Anti-patterns (co nikdy nedělat)'),
    reviewChecklist: has('cProjectDocs', 'Kontrolní seznam pro code review'),
    projectPlan: has('cProjectFiles', 'PROJECT_PLAN.md (fáze vývoje)'),
    manifest: has('cProjectFiles', '.agentic/manifest.json (strojový kontext)'),
    contributing: has('cProjectFiles', 'CONTRIBUTING.md (postup přispívání)'),
    clearBeforePreset: has('cPresetOptions', 'Před aplikací vyčistit doporučené skupiny')
  }
}

export function formatFromLabel(label: string): OutputFormat {
  if (/Rozšířený/.test(label)) return 'extended'
  if (/Jen instrukce/.test(label)) return 'instructions'
  return 'consolidated'
}

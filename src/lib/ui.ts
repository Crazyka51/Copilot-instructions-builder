// Sdílené konstanty a odvozené hodnoty pro UI.
import type { CSSProperties } from 'react'
import tabsData from '../data/tabs.json'
import type { Options, OutputFormat, TabDef } from './types'

export const tabs = tabsData.order as TabDef[]

/**
 * Zpozdění animace podle pořadí prvku, aby se karty a chips nasypaly postupne.
 * Strop drzime nizko, aby posledni prvek nezastal o pul sekundy.
 */
export function staggerStyle(index: number): CSSProperties {
  return { '--stagger': Math.min(index, 8) } as CSSProperties
}

/**
 * Název ZIP archivu odvozený z názvu projektu.
 *
 * Pozor: tohle je jen název staženého souboru. Slug, který se používá uvnitř
 * generovaných souborů, počítá `buildValues` v generate.ts a měnit se nesmí,
 * jinak by se rozešel výstup s paritním testem.
 */
export function zipFileName(projectName: string): string {
  const slug = (projectName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'projekt'}.zip`
}

/** Kapitoly průvodce, kopíruje kroky z PowerShell verze. */
export const WIZARD_STEPS = ['Projekt', 'Cíl', 'Technologie', 'Specifikace', 'Souhrn']

/**
 * Presety tab mirrors these cards onto the real selection keys.
 * Karty v záložce Presety jsou jen zkratky, volby se zapisují do karet podle tohoto mapování.
 */
export const PRESET_MIRROR: Record<string, string> = {
  rPresetDomain: 'rAppDomain',
  rPresetFramework: 'rFe',
  rPresetMobile: 'rMobile',
  rPresetTargets: 'rTarget'
}

/** Záložky rozdělené do logických skupin pro přehlednější navigaci. */
const GROUP_DEFS: { label: string; tabs: string[] }[] = [
  { label: 'Start', tabs: ['Presety', 'Projekt'] },
  { label: 'Technologie', tabs: ['Architektura', 'Frontend', 'Backend', 'DevOps', 'Bezpečnost'] },
  { label: 'Rozsah', tabs: ['Funkce', 'Moduly', 'Mobil'] },
  { label: 'Kvalita', tabs: ['Skills', 'Chování'] },
  { label: 'Pomoc', tabs: ['Slovník'] }
]

// Každá záložka musí být v některé skupině. Nezařazené doházíme do skupiny "Další",
// aby se při změně katalogu v PowerShellu žádná záložka neztratila.
const groupedLabels = new Set(GROUP_DEFS.flatMap((group) => group.tabs))
const leftoverLabels = tabs.map((tab) => tab.label).filter((label) => !groupedLabels.has(label))

export const TAB_GROUPS: { label: string; tabs: string[] }[] = leftoverLabels.length
  ? [...GROUP_DEFS, { label: 'Další', tabs: leftoverLabels }]
  : GROUP_DEFS

/** Záložky, které mají vlastní vykreslení a nezobrazují obecnou mřížku karet. */
export const SPECIAL_TABS = ['Presety', 'Skills', 'Projekt', 'Slovník']

/** Soubory, které se skutečně vygenerují pro daný formát a volby. */
export function filesForFormat(format: OutputFormat, options: Options, skillCount: number): string[] {
  const files = ['.github/copilot-instructions.md']
  if (format !== 'instructions') files.push('AGENTS.md', '.github/workflows/copilot-setup-steps.yml')
  if (format === 'extended') {
    if (skillCount > 0) files.push('.github/skills/SKILL.md')
    files.push('.github/agents/agent-task.agent.md')
  }
  if (options.taskPromptFile) files.push('.github/prompts/<slug>.prompt.md')
  if (options.projectPlan) files.push('PROJECT_PLAN.md')
  files.push('project.config.json', 'README.md', '.env.example')
  if (options.contributing) files.push('CONTRIBUTING.md')
  if (options.manifest) files.push('.agentic/manifest.json')
  return files
}

/**
 * Kolik souborů se vygeneruje. Vychází z `filesForFormat`, takže seznam v UI
 * i skutečný výstup generátoru zůstanou v souladu (hlídá to test).
 */
export function expectedFileCount(format: OutputFormat, options: Options, skillCount: number): number {
  return filesForFormat(format, options, skillCount).length
}

/** Lidský popis formátu výstupu. */
export function formatLabel(format: OutputFormat): string {
  if (format === 'extended') return 'Rozšířený'
  if (format === 'instructions') return 'Jen instrukce'
  return 'Konsolidovaný'
}

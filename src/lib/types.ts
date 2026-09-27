/** Shared types for the builder. */

export type CardKind = 'radio' | 'check'

export interface Card {
  id: string
  title: string
  kind: CardKind
  tab: string
  options: string[]
  dynamic?: 'skills'
  pos?: { x: number; y: number; w: number; h: number } | null
}

export interface TabDef {
  icon: string
  label: string
}

/** card id -> checked option labels (radio cards hold at most one) */
export type Selection = Record<string, string[]>

/** Free-text specification captured by the wizard. */
export interface Spec {
  creates: string
  audience: string
  tech: string
  functions: string
  files: string
  forbiddenDependencies: string
}

export interface Project {
  name: string
  goal: string
  selection: Selection
  spec: Spec
}

export type SkillScope = 'selected' | 'all' | 'none'

export interface SkillEntry {
  category: string
  slug: string
  title: string
  description: string
  checklist: string[]
}

export interface PresetEntry {
  card: string
  items: string[]
}

export interface PresetTrigger {
  card: string | null
  kind: 'domain' | 'framework' | 'mobile' | 'target' | 'other'
}

/** Everything the generated templates need. */
export interface GenCtx {
  v: Record<string, string>
  lists: Record<string, string>
  p: string
  slug: string
  modeExtended: boolean
  sk: SkillEntry
  neonSection: string
  supabaseSection: string
  mobileSection: string
  tipTapSection: string
  vercelSection: string
  specializedSection: string
  legalSection: string
  domainPersona: string
  usePnpm: boolean
  hasValidation: boolean
  stackLines: string[]
  /** helpers used by templates */
  fence: string
  goalText: string
  role: string
  taskBody: string
  cmdInstall: string
  cmdDev: string
  cmdBuild: string
  cmdTest: string
  cmdLint: string
  cmdTypecheck: string
  asSection: (text: string) => string
  behaviorBullets: (rawList: string) => string
  stackPair: (a: string, b: string) => string
}

export interface GeneratedFile {
  path: string
  content: string
  language: 'markdown' | 'yaml' | 'json'
}

export type OutputFormat = 'consolidated' | 'extended' | 'instructions'

export interface Options {
  /** output format (mirrors the "Formát výstupu" card) */
  format: OutputFormat
  /** skills */
  skillScope: SkillScope
  skillChecklist: boolean
  skillExample: boolean
  skillRelated: boolean
  skillMetadata: boolean
  skillSummary: boolean
  taskPromptInDoc: boolean
  taskPromptFile: boolean
  /** extra sections in copilot-instructions.md */
  repoStructure: boolean
  workflow: boolean
  antiPatterns: boolean
  reviewChecklist: boolean
  /** standalone project files */
  projectPlan: boolean
  manifest: boolean
  contributing: boolean
  /** clear recommended groups before applying a preset */
  clearBeforePreset: boolean
}

export const defaultOptions = (): Options => ({
  format: 'consolidated',
  skillScope: 'selected',
  skillChecklist: true,
  skillExample: false,
  skillRelated: false,
  skillMetadata: false,
  skillSummary: false,
  taskPromptInDoc: true,
  taskPromptFile: false,
  repoStructure: false,
  workflow: false,
  antiPatterns: false,
  reviewChecklist: false,
  projectPlan: true,
  manifest: true,
  contributing: false,
  clearBeforePreset: false
})

export const defaultSpec = (): Spec => ({
  creates: '',
  audience: '',
  tech: 'Next.js (App Router), React, TypeScript, Node.js ekosystém',
  functions: '',
  files: '',
  forbiddenDependencies: ''
})

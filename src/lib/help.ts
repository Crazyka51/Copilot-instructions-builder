// Přístup k nápovědě voleb. Hledání je odolné vůči velikosti písmen,
// protože zdrojový PowerShell má občas jiný case klíče než text volby.
import helpData from '../data/help.json'

const help = helpData as Record<string, string>

const byLower = new Map<string, string>()
for (const [key, value] of Object.entries(help)) {
  const lowered = key.toLocaleLowerCase('cs')
  if (!byLower.has(lowered)) byLower.set(lowered, value)
}

/** Vrátí text nápovědy k volbě nebo skillu, nebo prázdný řetězec. */
export function helpFor(label: string): string {
  if (!label) return ''
  return help[label] ?? byLower.get(label.toLocaleLowerCase('cs')) ?? ''
}

/** Abecedně seřazené klíče nápovědy pro slovník. */
export function helpLabels(): string[] {
  return Object.keys(help).sort((a, b) => a.localeCompare(b, 'cs'))
}

/** Filtruje klíče nápovědy podle dotazu (název i text). */
export function filterHelpKeys(query: string, extra?: (text: string) => string): string[] {
  const keys = helpLabels()
  const q = query.trim().toLocaleLowerCase('cs')
  if (!q) return keys
  const matches = (text: string) =>
    `${text} ${extra?.(text) ?? ''}`.toLocaleLowerCase('cs').includes(q)
  return keys.filter((key) => matches(key) || matches(help[key] ?? ''))
}

export const helpCount = Object.keys(help).length

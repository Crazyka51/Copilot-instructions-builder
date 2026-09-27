// Vyhledání zdrojového PowerShell skriptu CopilotBuilderPro2.ps1.
// Pořadí: explicitní argument, proměnná CB_BUILDER_PS1, vendorovaná kopie, výchozí cesta.
// Používáno skripty extract.mjs, parity.mjs a vendor-ps1.mjs.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

/** Výchozí umístění, odkud skript historicky pochází. */
export const DEFAULT_PS1 = 'C:\\Users\\matej\\.copilot\\attachments\\CopilotBuilderPro2.ps1'
/** Vendorovaná kopie uvnitř repozitáře (vytvoří ji `pnpm run vendor:ps1`). */
export const VENDOR_PS1 = path.join(here, 'vendor', 'CopilotBuilderPro2.ps1')

function isFile(candidate) {
  try {
    return fs.statSync(candidate).isFile()
  } catch {
    return false
  }
}

/** Vrátí seznam kandidátních cest v pořadí priority. */
export function candidatePaths(explicit) {
  return [explicit, process.env.CB_BUILDER_PS1, VENDOR_PS1, DEFAULT_PS1].filter(Boolean)
}

/**
 * Najde existující cestu k PS skriptu, nebo vyhodí srozumitelnou chybu
 * se seznamem zkoušených cest a návodem, jak cestu předat.
 */
export function resolvePs1(explicit) {
  const candidates = candidatePaths(explicit)
  const found = candidates.find(isFile)
  if (found) return path.resolve(found)
  const tried = candidates.map((p) => `  - ${p}`).join('\n')
  throw new Error(
    [
      'Zdrojovy skript CopilotBuilderPro2.ps1 nebyl nalezen.',
      'Zkousene cesty:',
      tried,
      '',
      'Jak to opravit:',
      '  1) predej cestu argumentem:  node scripts/extract.mjs "D:\\cesta\\CopilotBuilderPro2.ps1"',
      '  2) nebo nastav promennou prostredi:  $env:CB_BUILDER_PS1 = "D:\\cesta\\CopilotBuilderPro2.ps1"',
      '  3) nebo skript zavendoruj do repozitare:  pnpm run vendor:ps1'
    ].join('\n')
  )
}

/** SHA256 (velká písmena) obsahu souboru. */
export function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase()
}

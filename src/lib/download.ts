// Stažení vygenerovaných souborů v prohlížeči.
import { createZip, type ZipFile } from './zip'

/** Stáhne připravený blob pod daným názvem. */
export function downloadBlob(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** Stáhne jeden soubor jako text. */
export function download(name: string, content: string, mime: string): void {
  downloadBlob(name, new Blob([content], { type: `${mime};charset=utf-8` }))
}

/**
 * Stáhne všechny soubory najednou jako jeden ZIP archiv.
 *
 * Dřív se pouštělo víc stažení za sebou, jenže prohlížeče takové chování blokují
 * a uživatel dostal jen první soubor. Jeden archiv je navíc praktičtější, protože
 * se dá rozbalit přímo do kořene repozitáře a zachová cesty.
 */
export async function downloadZip(name: string, files: ZipFile[]): Promise<void> {
  const bytes = await createZip(files)
  downloadBlob(name, new Blob([bytes], { type: 'application/zip' }))
}

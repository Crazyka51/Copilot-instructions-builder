// Stažení vygenerovaných souborů v prohlížeči.

/** Stáhne jeden soubor jako blob. */
export function download(name: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * Stáhne sadu souborů pod jejich názvy. Prohlížeč může některá stažení zablokovat,
 * proto mezi jednotlivými soubory necháváme malou mezeru.
 */
export function downloadMany(files: { path: string; content: string }[]): void {
  files.forEach((file, index) => {
    const name = file.path.split('/').pop() ?? 'soubor.txt'
    window.setTimeout(() => download(name, file.content, 'text/plain'), index * 120)
  })
}

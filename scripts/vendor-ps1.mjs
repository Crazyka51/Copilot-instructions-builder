// Zkopíruje zdrojový PowerShell skript do scripts/vendor/, aby byl paritní test
// reprodukovatelný i bez přístupu k původnímu umístění.
// Použití: node scripts/vendor-ps1.mjs [cesta-k-ps1]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolvePs1, sha256 } from './resolve-ps1.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const vendorDir = path.join(here, 'vendor')
const target = path.join(vendorDir, 'CopilotBuilderPro2.ps1')

let source
try {
  source = resolvePs1(process.argv[2])
} catch (error) {
  console.error(error.message ?? String(error))
  process.exit(1)
}

fs.mkdirSync(vendorDir, { recursive: true })
fs.copyFileSync(source, target)

const hash = sha256(target)
const manifest = {
  file: 'CopilotBuilderPro2.ps1',
  source,
  sha256: hash,
  bytes: fs.statSync(target).size,
  vendoredAt: new Date().toISOString()
}
fs.writeFileSync(path.join(vendorDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')

console.log(`Vendorovano: ${target}`)
console.log(`Zdroj: ${source}`)
console.log(`SHA256: ${hash}`)
console.log('Paritni test i extrakce nyni pouziji vendorovanou kopii.')

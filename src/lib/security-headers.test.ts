// Hlídá, že bezpečnostní hlavičky sedí na všech místech, odkud se aplikace
// nasazuje. Když se jedno z nich vynechá, test spadne.
//
// Aplikace je statická, takže hlavičku musí nastavit každý hosting zvlášť.
// Meta tag v index.html by nefungoval, prohlížeče u této hlavičky meta tag ignorují.
import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfigFromFile } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

const HEADER = 'X-Content-Type-Options'
const VALUE = 'nosniff'

test('dev a preview server Vite posílají nosniff', async () => {
  const loaded = await loadConfigFromFile({ command: 'serve', mode: 'development' }, undefined, root)
  assert.ok(loaded, 'konfigurace Vite se musí načíst')

  const { server, preview } = loaded.config
  assert.equal(server?.headers?.[HEADER], VALUE, 'chybí hlavička pro dev server')
  assert.equal(preview?.headers?.[HEADER], VALUE, 'chybí hlavička pro preview server')
})

test('public/_headers nastavuje nosniff pro všechny cesty', () => {
  const file = path.join(root, 'public', '_headers')
  assert.ok(existsSync(file), 'public/_headers musí existovat kvůli Netlify a Cloudflare Pages')

  const text = readFileSync(file, 'utf8')
  assert.match(text, /^\/\*$/m, '_headers musí platit pro všechny cesty')
  assert.match(text, new RegExp(`${HEADER}:\\s*${VALUE}`), `_headers musí obsahovat ${HEADER}`)
})

test('vercel.json nastavuje nosniff pro všechny cesty', () => {
  const file = path.join(root, 'vercel.json')
  assert.ok(existsSync(file), 'vercel.json musí existovat kvůli nasazení na Vercel')

  const json = JSON.parse(readFileSync(file, 'utf8')) as {
    headers?: { source: string; headers: { key: string; value: string }[] }[]
  }
  const rule = json.headers?.find((entry) => entry.source === '/(.*)')
  assert.ok(rule, 'vercel.json musí mít pravidlo pro všechny cesty')

  const header = rule.headers.find((entry) => entry.key === HEADER)
  assert.ok(header, `vercel.json musí obsahovat ${HEADER}`)
  assert.equal(header.value, VALUE)
})

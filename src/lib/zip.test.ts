// Testy ZIP archivu.
//
// Testy si archiv samy přečtou a porovnají obsah, takže ověří skutečnou
// strukturu formátu, ne jen to, že funkce nic nevyhodí.
import test from 'node:test'
import assert from 'node:assert/strict'
import { createZip, crc32, type ZipBytes, type ZipFile } from './zip'
import { zipFileName } from './ui'

const END_SIGNATURE = 0x06054b50
const CENTRAL_SIGNATURE = 0x02014b50
const LOCAL_SIGNATURE = 0x04034b50

interface ReadEntry {
  name: string
  method: number
  crc: number
  compressedSize: number
  size: number
  content: string
}

/** Minimální čtečka ZIPu, aby testy nezávisely na knihovně. */
async function readZip(bytes: ZipBytes): Promise<ReadEntry[]> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const decoder = new TextDecoder()

  // Najdeme konec centrálního adresáře od konce souboru.
  let end = -1
  for (let i = bytes.length - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === END_SIGNATURE) {
      end = i
      break
    }
  }
  assert.notEqual(end, -1, 'archiv musí obsahovat konec centrálního adresáře')

  const count = view.getUint16(end + 10, true)
  let cursor = view.getUint32(end + 16, true)
  const entries: ReadEntry[] = []

  for (let i = 0; i < count; i++) {
    assert.equal(view.getUint32(cursor, true), CENTRAL_SIGNATURE, 'centrální adresář musí mít platnou hlavičku')
    const method = view.getUint16(cursor + 10, true)
    const crc = view.getUint32(cursor + 16, true)
    const compressedSize = view.getUint32(cursor + 20, true)
    const size = view.getUint32(cursor + 24, true)
    const nameLength = view.getUint16(cursor + 28, true)
    const localOffset = view.getUint32(cursor + 42, true)
    const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength))

    assert.equal(view.getUint32(localOffset, true), LOCAL_SIGNATURE, 'lokální hlavička musí mít platnou signaturu')
    const localNameLength = view.getUint16(localOffset + 26, true)
    const dataStart = localOffset + 30 + localNameLength
    const data = bytes.subarray(dataStart, dataStart + compressedSize)

    const content =
      method === 0
        ? decoder.decode(data)
        : decoder.decode(
            new Uint8Array(
              await new Response(
                new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
              ).arrayBuffer()
            )
          )

    entries.push({ name, method, crc, compressedSize, size, content })
    cursor += 46 + nameLength + view.getUint16(cursor + 30, true) + view.getUint16(cursor + 32, true)
  }

  return entries
}

const SAMPLE: ZipFile[] = [
  { path: '.github/copilot-instructions.md', content: '# Instrukce\n\nČeský text s diakritikou.' },
  { path: 'AGENTS.md', content: '# Agents' },
  { path: '.env.example', content: 'DATABASE_URL=' }
]

test('crc32 odpovídá kontrolním hodnotám', () => {
  const encoder = new TextEncoder()
  assert.equal(crc32(encoder.encode('')), 0)
  assert.equal(crc32(encoder.encode('hello')), 0x3610a686)
  // Standardní kontrolní hodnota CRC32 pro "123456789".
  assert.equal(crc32(encoder.encode('123456789')), 0xcbf43926)
})

test('archiv obsahuje všechny soubory s cestami i obsahem', async () => {
  const entries = await readZip(await createZip(SAMPLE))
  assert.deepEqual(
    entries.map((entry) => entry.name),
    SAMPLE.map((file) => file.path)
  )
  for (const [index, entry] of entries.entries()) {
    assert.equal(entry.content, SAMPLE[index].content, `obsah souboru ${entry.name} musí sedět`)
    assert.equal(entry.size, new TextEncoder().encode(SAMPLE[index].content).length, 'velikost musí sedět')
    assert.equal(entry.crc, crc32(new TextEncoder().encode(SAMPLE[index].content)), 'CRC musí sedět')
  }
})

test('komprese zmenší archiv a zachová obsah', async () => {
  const big: ZipFile[] = [
    { path: 'big.md', content: 'opakující se řádek s diakritikou\n'.repeat(400) }
  ]

  const compressed = await createZip(big)
  const stored = await createZip(big, { compress: false })

  assert.ok(compressed.length < stored.length, 'komprimovaný archiv musí být menší')

  const entries = await readZip(compressed)
  assert.equal(entries[0].content, big[0].content, 'obsah po kompresi musí sedět')
  assert.equal(entries[0].method, 8, 'velký opakující se text se má komprimovat')
})

test('bez komprese se použije metoda store', async () => {
  const entries = await readZip(await createZip(SAMPLE, { compress: false }))
  assert.ok(entries.every((entry) => entry.method === 0), 'všechny položky mají být uložené')
  assert.deepEqual(
    entries.map((entry) => entry.content),
    SAMPLE.map((file) => file.content)
  )
})

test('prázdný archiv je platný a má nula položek', async () => {
  const bytes = await createZip([])
  assert.equal(bytes.length, 22, 'prázdný archiv má jen konec centrálního adresáře')
  assert.deepEqual(await readZip(bytes), [])
})

test('archiv zvládne prázdný soubor i delší cestu ve složce', async () => {
  const files: ZipFile[] = [
    { path: '.github/prompts/muj-projekt.prompt.md', content: '' },
    { path: '.agentic/manifest.json', content: '{\n  "a": 1\n}' }
  ]
  const entries = await readZip(await createZip(files))
  assert.deepEqual(
    entries.map((entry) => entry.name),
    files.map((file) => file.path)
  )
  assert.equal(entries[0].content, '')
  assert.equal(entries[1].content, files[1].content)
})

test('název archivu se odvodí z názvu projektu', () => {
  assert.equal(zipFileName('EnterpriseProject'), 'enterpriseproject.zip')
  assert.equal(zipFileName('Můj E-shop 2026'), 'muj-e-shop-2026.zip')
  assert.equal(zipFileName('  CRM/Interní  '), 'crm-interni.zip')
  assert.equal(zipFileName(''), 'projekt.zip')
  assert.equal(zipFileName('///'), 'projekt.zip')
})

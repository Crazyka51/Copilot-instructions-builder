// Sestavení ZIP archivu bez externí závislosti.
//
// Proč vlastní implementace: projekt má v produkci jen React, takže přidávat
// knihovnu kvůli jednomu tlačítku nedává smysl. Formát ZIP je otevřený a pro
// zápis stačí hlavičky, CRC32 a volitelně deflate.
//
// Komprese používá nativní `CompressionStream('deflate-raw')`. Když ji prohlížeč
// nemá, uloží se soubor nekomprimovaně (metoda 0). Takový archiv je pořád platný
// a otevře ho každý nástroj, jen je větší.

const LOCAL_SIGNATURE = 0x04034b50
const CENTRAL_SIGNATURE = 0x02014b50
const END_SIGNATURE = 0x06054b50

/** Verze formátu 2.0, dostatečná pro deflate i UTF-8 názvy. */
const VERSION = 20
/** Bit 11 znamená, že názvy jsou v UTF-8. */
const FLAG_UTF8 = 0x0800
/** Metoda komprese podle specifikace. */
const METHOD_STORE = 0
const METHOD_DEFLATE = 8
/** Práva běžného souboru pro unixové nástroje (zapsaná v horních 16 bitech). */
const EXTERNAL_ATTRIBUTES = (0o100644 << 16) >>> 0

export interface ZipFile {
  /** Cesta v archivu, například `.github/copilot-instructions.md`. */
  path: string
  content: string
}

/**
 * Bajty nad konkrétním ArrayBufferem. Novější TypeScript rozlišuje ArrayBuffer
 * a SharedArrayBuffer a Blob i Response berou jen ten první, proto vlastní alias.
 */
export type ZipBytes = Uint8Array<ArrayBuffer>

let crcTable: Uint32Array | null = null

function getCrcTable(): Uint32Array {
  if (crcTable) return crcTable
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let value = i
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[i] = value >>> 0
  }
  crcTable = table
  return table
}

/** Kontrolní součet CRC32, který ZIP vyžaduje u každé položky. */
export function crc32(bytes: Uint8Array): number {
  const table = getCrcTable()
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc = table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

/** Datum a čas ve formátu DOS, který ZIP používá. */
function dosDateTime(date: Date): { time: number; date: number } {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)
  const year = Math.max(1980, date.getFullYear())
  const day = (year - 1980) << 9 | ((date.getMonth() + 1) << 5) | date.getDate()
  return { time, date: day }
}

/** Nechá data projít nativním deflate, nebo vrátí null, když to nejde. */
async function deflateRaw(bytes: ZipBytes): Promise<ZipBytes | null> {
  if (typeof CompressionStream === 'undefined') return null
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))
    const packed = new Uint8Array(await new Response(stream).arrayBuffer())
    // Když se komprese nevyplatí, uložíme data rovnou.
    return packed.length < bytes.length ? packed : null
  } catch {
    return null
  }
}

interface PreparedEntry {
  name: ZipBytes
  raw: ZipBytes
  data: ZipBytes
  method: number
  crc: number
  offset: number
}

/**
 * Sestaví ZIP archiv z textových souborů. Cesty se v archivu zachovají včetně
 * složek, takže se dá obsah rozbalit přímo do kořene repozitáře.
 */
export async function createZip(files: ZipFile[], options: { compress?: boolean } = {}): Promise<ZipBytes> {
  const compress = options.compress !== false
  const encoder = new TextEncoder()
  const entries: PreparedEntry[] = []
  let offset = 0

  for (const file of files) {
    const name = encoder.encode(file.path.replace(/\\/g, '/'))
    const raw = encoder.encode(file.content)
    let data = raw
    let method = METHOD_STORE

    if (compress && raw.length > 0) {
      const packed = await deflateRaw(raw)
      if (packed) {
        data = packed
        method = METHOD_DEFLATE
      }
    }

    entries.push({ name, raw, data, method, crc: crc32(raw), offset })
    offset += 30 + name.length + data.length
  }

  const centralSize = entries.reduce((sum, entry) => sum + 46 + entry.name.length, 0)
  const out = new Uint8Array(offset + centralSize + 22)
  const view = new DataView(out.buffer)
  const stamp = dosDateTime(new Date())

  const writeHeader = (entry: PreparedEntry, at: number): number => {
    view.setUint32(at, LOCAL_SIGNATURE, true)
    view.setUint16(at + 4, VERSION, true)
    view.setUint16(at + 6, FLAG_UTF8, true)
    view.setUint16(at + 8, entry.method, true)
    view.setUint16(at + 10, stamp.time, true)
    view.setUint16(at + 12, stamp.date, true)
    view.setUint32(at + 14, entry.crc, true)
    view.setUint32(at + 18, entry.data.length, true)
    view.setUint32(at + 22, entry.raw.length, true)
    view.setUint16(at + 26, entry.name.length, true)
    view.setUint16(at + 28, 0, true)
    out.set(entry.name, at + 30)
    out.set(entry.data, at + 30 + entry.name.length)
    return at + 30 + entry.name.length + entry.data.length
  }

  let cursor = 0
  for (const entry of entries) cursor = writeHeader(entry, cursor)

  const centralStart = cursor
  for (const entry of entries) {
    view.setUint32(cursor, CENTRAL_SIGNATURE, true)
    view.setUint16(cursor + 4, VERSION, true)
    view.setUint16(cursor + 6, VERSION, true)
    view.setUint16(cursor + 8, FLAG_UTF8, true)
    view.setUint16(cursor + 10, entry.method, true)
    view.setUint16(cursor + 12, stamp.time, true)
    view.setUint16(cursor + 14, stamp.date, true)
    view.setUint32(cursor + 16, entry.crc, true)
    view.setUint32(cursor + 20, entry.data.length, true)
    view.setUint32(cursor + 24, entry.raw.length, true)
    view.setUint16(cursor + 28, entry.name.length, true)
    view.setUint16(cursor + 30, 0, true)
    view.setUint16(cursor + 32, 0, true)
    view.setUint16(cursor + 34, 0, true)
    view.setUint16(cursor + 36, 0, true)
    view.setUint32(cursor + 38, EXTERNAL_ATTRIBUTES, true)
    view.setUint32(cursor + 42, entry.offset, true)
    cursor += 46
    out.set(entry.name, cursor)
    cursor += entry.name.length
  }

  view.setUint32(cursor, END_SIGNATURE, true)
  view.setUint16(cursor + 4, 0, true)
  view.setUint16(cursor + 6, 0, true)
  view.setUint16(cursor + 8, entries.length, true)
  view.setUint16(cursor + 10, entries.length, true)
  view.setUint32(cursor + 12, centralSize, true)
  view.setUint32(cursor + 16, centralStart, true)
  view.setUint16(cursor + 20, 0, true)

  return out
}

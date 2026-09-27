// Extracts data and templates from CopilotBuilderPro2.ps1 into JSON + raw text files.
// Run: node scripts/extract.mjs <path-to-ps1>
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolvePs1, sha256 } from './resolve-ps1.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const ps1Path = resolvePs1(process.argv[2])
const src = fs.readFileSync(ps1Path, 'utf8')
const lines = src.split(/\r?\n/)
console.log(`Zdroj: ${ps1Path}`)
console.log(`SHA256: ${sha256(ps1Path)}`)

const dataDir = path.join(root, 'src', 'data')
const rawDir = path.join(here, 'raw')
fs.mkdirSync(dataDir, { recursive: true })
fs.rmSync(rawDir, { recursive: true, force: true })
fs.mkdirSync(rawDir, { recursive: true })

const report = { ps1Lines: lines.length, steps: [] }
const log = (m) => { report.steps.push(m); console.log(m) }

// ---------- helpers ----------

/** From index of an opening bracket/paren, return index of the matching close, skipping quoted text. */
function scanBalanced(s, i, open = '(', close = ')') {
  let depth = 0
  let q = null
  for (let k = i; k < s.length; k++) {
    const c = s[k]
    if (q) {
      if (q === '"' && c === '\\') { k++; continue }
      if (c === q) {
        // PowerShell escapes ' by doubling it
        if (q === "'" && s[k + 1] === "'") { k++; continue }
        q = null
      }
      continue
    }
    if (c === '"' || c === "'") { q = c; continue }
    if (c === open) depth++
    else if (c === close) { depth--; if (depth === 0) return k }
  }
  return -1
}

/** Parse a PowerShell array body into string items. */
function parseItems(inner) {
  const items = []
  let q = null
  let cur = ''
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i]
    if (q) {
      if (q === '"' && c === '\\') { cur += inner[++i] ?? ''; continue }
      if (c === q) {
        if (q === "'" && inner[i + 1] === "'") { cur += "'"; i++; continue }
        items.push(cur); cur = ''; q = null; continue
      }
      cur += c; continue
    }
    if (c === '"' || c === "'") { q = c; continue }
  }
  return items
}

/** Find the here-string assigned to $name (or $name[...]) and return its raw body. */
function findHereString(name) {
  const re = new RegExp('\\$' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "(?:\\[[^\\]]*\\])?\\s*=\\s*@\"", 'm')
  const m = re.exec(src)
  if (!m) return null
  const start = m.index + m[0].length
  // body starts after the newline following @"
  let bodyStart = src.indexOf('\n', start)
  if (bodyStart === -1) return null
  bodyStart += 1
  // find a line that is only whitespace + "@
  const closeRe = /^[ \t]*"@[ \t]*$/gm
  closeRe.lastIndex = bodyStart
  const cm = closeRe.exec(src)
  if (!cm) return null
  return { body: src.slice(bodyStart, cm.index).replace(/\r?\n$/, ''), from: bodyStart, to: cm.index }
}

/** Extract a whole function body by name (crude brace matching). */
function findFunction(name) {
  const re = new RegExp('^\\s*Function\\s+' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'm')
  const m = re.exec(src)
  if (!m) return null
  const braceStart = src.indexOf('{', m.index)
  if (braceStart === -1) return null
  const end = scanBalanced(src, braceStart, '{', '}')
  if (end === -1) return null
  return src.slice(m.index, end + 1)
}

const num = (s) => Number.parseInt(s, 10)

/** Ruční záplaty, které přežijí regeneraci dat (viz scripts/patches.json). */
const patchesPath = path.join(here, 'patches.json')
function loadPatches() {
  if (!fs.existsSync(patchesPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(patchesPath, 'utf8'))
  } catch (error) {
    console.log(`WARN: nelze nacist scripts/patches.json: ${String(error)}`)
    return {}
  }
}

// ---------- 1. tabs ----------
const tabOrder = []
{
  const m = /\$navItems\s*=\s*@\(([\s\S]*?)\r?\n\)/.exec(src)
  if (!m) throw new Error('navItems not found')
  const entries = [...m[1].matchAll(/@\("((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)"\)/g)]
  for (const e of entries) tabOrder.push({ icon: e[1], label: e[2] })
  log(`tabs from navItems: ${tabOrder.length}`)
}

const tabVarToLabel = {}
{
  const re = /^\s*\$(\w+)\s*=\s*New-ReferencePage\s+"((?:[^"\\]|\\.)*)"/gm
  let m
  while ((m = re.exec(src))) tabVarToLabel[m[1]] = m[2]
  log(`tab pages: ${Object.keys(tabVarToLabel).length}`)
}

// ---------- 2. shared option lists ----------
const sharedLists = {}
{
  const re = /^\s*\$(\w+)\s*=\s*@\(/gm
  let m
  while ((m = re.exec(src))) {
    if (!/^opt[A-Z]/.test(m[1])) continue
    const open = m.index + m[0].length - 1
    const close = scanBalanced(src, open)
    if (close === -1) continue
    sharedLists[m[1]] = parseItems(src.slice(open + 1, close))
  }
  log(`shared option lists: ${Object.keys(sharedLists).map((k) => `${k}(${sharedLists[k].length})`).join(', ')}`)
}

// ---------- 3. cards ----------
const cards = []
const cardByVar = {}
{
  const re = /\$(\w+)\s*=\s*Add-(Radio|Check)Group\s+\$(\w+)\s+"((?:[^"\\]|\\.)*)"\s+/g
  let m
  while ((m = re.exec(src))) {
    const [full, varName, kindRaw, tabVar, title] = m
    const after = m.index + full.length
    let options = []
    let consumed = after
    if (src[after] === '@') {
      const open = after + 1
      const close = scanBalanced(src, open)
      options = parseItems(src.slice(open + 1, close))
      consumed = close + 1
    } else {
      const om = /^\$(\w+)/.exec(src.slice(after))
      if (om) {
        options = sharedLists[om[1]] ?? []
        consumed = after + om[0].length
      }
    }
    const tail = /^\s+(-?\d+)\s+(-?\d+)\s+(\d+)\s+(\d+)/.exec(src.slice(consumed))
    const card = {
      id: varName,
      title,
      kind: kindRaw === 'Radio' ? 'radio' : 'check',
      tab: tabVarToLabel[tabVar] ?? tabVar,
      options,
      pos: tail ? { x: num(tail[1]), y: num(tail[2]), w: num(tail[3]), h: num(tail[4]) } : null
    }
    cards.push(card)
    cardByVar[varName] = card
    re.lastIndex = consumed
  }
  log(`cards: ${cards.length}, options total: ${cards.reduce((a, c) => a + c.options.length, 0)}`)

  // diagnostics: cards with no or suspiciously few options
  const suspect = cards.filter((c) => !c.dynamic && c.options.length === 0)
  if (suspect.length) log(`WARN cards without options: ${suspect.map((c) => c.id).join(', ')}`)
  const fromShared = cards.filter((c) => !c.dynamic && c.options.length > 0 && c.options === sharedLists.rFe)
  if (fromShared.length) log(`cards using optFrameworks: ${fromShared.map((c) => c.id).join(', ')}`)

  // dynamic skill groups (created in a loop from the skill catalog)
  const dyn = /\$skillGroups\[\$cat\]\s*=\s*Add-CheckGroup\s+\$(\w+)\s+\$cat\s+\$catTitles/.exec(src)
  if (dyn) {
    cards.push({ id: 'skillGroups', title: '(skills)', kind: 'check', tab: tabVarToLabel[dyn[1]] ?? dyn[1], options: [], dynamic: 'skills', pos: null })
    log('dynamic skill group detected')
  }
}

// ---------- 4. skill catalog ----------
const skills = []
{
  const block = /\$script:skillCatalog\s*=\s*@\(([\s\S]*?)\r?\n\)/m.exec(src)
  if (!block) throw new Error('skillCatalog not found')
  const body = block[1]
  const re = /\{\s*C\s*=\s*'((?:[^']|'')*)';\s*S\s*=\s*'((?:[^']|'')*)';\s*T\s*=\s*'((?:[^']|'')*)'/g
  let m
  while ((m = re.exec(body))) {
    // D and K follow within this entry: read from m.index up to next entry start or end
    const nextIdx = (() => {
      const r2 = new RegExp(re.source, 'g')
      r2.lastIndex = re.lastIndex
      const n = r2.exec(body)
      return n ? n.index : body.length
    })()
    const chunk = body.slice(m.index, nextIdx)
    const dm = /\n\s*D\s*=\s*'((?:[^']|'')*)'/.exec(chunk)
    const km = /\n\s*K\s*=\s*@\(([\s\S]*?)\)\s*\}/.exec(chunk)
    skills.push({
      category: m[1].replace(/''/g, "'"),
      slug: m[2],
      title: m[3].replace(/''/g, "'"),
      description: dm ? dm[1].replace(/''/g, "'") : '',
      checklist: km ? parseItems(km[1]) : []
    })
  }
  log(`skills: ${skills.length}, categories: ${new Set(skills.map((s) => s.category)).size}`)
}

// ---------- 5. skill category steps ----------
const categorySteps = {}
{
  const m = /\$script:skillCategorySteps\s*=\s*@\{([\s\S]*?)\r?\n\}/.exec(src)
  if (m) {
    const body = m[1]
    // Pozor: necheme non-greedy `@\(...\)` – uvnitř řetězců se vyskytují závorky.
    const re = /'((?:[^']|'')*)'\s*=\s*@\(/g
    let x
    while ((x = re.exec(body))) {
      const openIdx = x.index + x[0].length - 1
      const closeIdx = scanBalanced(body, openIdx)
      if (closeIdx < 0) continue
      categorySteps[x[1].replace(/''/g, "'")] = parseItems(body.slice(openIdx + 1, closeIdx))
      re.lastIndex = closeIdx + 1
    }
  }
  log(`category steps: ${Object.keys(categorySteps).length}`)
}

// ---------- 6. help texts ----------
const help = {}
{
  // base dictionary
  const m = /\$script:helpText\s*=\s*@\{([\s\S]*?)\r?\n\}/.exec(src)
  if (m) {
    const re = /^\s*"((?:[^"\\]|\\.)*)"\s*=\s*"((?:[^"\\]|\\.)*)"\s*$/gm
    let x
    while ((x = re.exec(m[1]))) help[x[1].replace(/\\"/g, '"')] = x[2].replace(/\\"/g, '"')
  }
  log(`help base entries: ${Object.keys(help).length}`)

  // detail blocks: 'Key' = @( ... ) -join "`n"
  const re = /^\s*'((?:[^']|'')*)'\s*=\s*@\(\s*\r?\n([\s\S]*?)\r?\n\s*\)\s*-join/gm
  let x
  let details = 0
  while ((x = re.exec(src))) {
    const key = x[1].replace(/''/g, "'")
    const body = parseItems(x[2]).join('\n')
    if (!body) continue
    details++
    if (help[key]) help[key] = help[key].trimEnd() + '\n\n' + body
    else help[key] = body
  }
  log(`help detail blocks: ${details}, merged help keys: ${Object.keys(help).length}`)
}

// ---------- 6b. ruční záplaty nápovědy ----------
const patches = loadPatches()
{
  const aliases = patches.helpAliases ?? {}
  const extra = patches.helpExtra ?? {}
  let aliased = 0
  let added = 0
  for (const [key, target] of Object.entries(aliases)) {
    if (help[key] === undefined && help[target] !== undefined) {
      help[key] = help[target]
      aliased++
    }
  }
  for (const [key, text] of Object.entries(extra)) {
    if (help[key] !== text) {
      help[key] = text
      added++
    }
  }
  if (aliased || added) log(`patches: ${aliased} aliasu, ${added} doplnenych napoved`)
}

// ---------- 7. presets ----------
function parsePresetBody(body) {
  const entries = []
  const re = /\{\s*C\s*=\s*\$(\w+)\s*;\s*I\s*=\s*@\(([\s\S]*?)\)\s*\}/g
  let m
  while ((m = re.exec(body))) entries.push({ card: m[1], items: parseItems(m[2]) })
  return entries
}

const presets = {}
const presetTech = {}
let presetBaseStack = []
{
  const re = /\$script:presets\['((?:[^']|'')*)'\]\s*=\s*@\(([\s\S]*?)\r?\n\)/g
  let m
  while ((m = re.exec(src))) presets[m[1].replace(/''/g, "'")] = parsePresetBody(m[2])

  const reTech = /\$script:presetTech\['((?:[^']|'')*)'\]\s*=\s*@\(([\s\S]*?)\r?\n\)/g
  while ((m = reTech.exec(src))) presetTech[m[1].replace(/''/g, "'")] = parsePresetBody(m[2])

  const bs = /\$script:presetBaseStack\s*=\s*@\(([\s\S]*?)\r?\n\)/m.exec(src)
  if (bs) presetBaseStack = parsePresetBody(bs[1])

  log(`presets: ${Object.keys(presets).length}, tech variants: ${Object.keys(presetTech).length}, base stack: ${presetBaseStack.length}`)
}

// merge like the PS1 does: base + tech + module entries
const mergedPresets = {}
for (const label of Object.keys(presets)) {
  mergedPresets[label] = [...presetBaseStack, ...(presetTech[label] ?? []), ...presets[label]]
}

// preset kind (which radio group triggers it)
const triggerOf = {}
for (const label of Object.keys(mergedPresets)) {
  if (cardByVar.rAppDomain?.options.includes(label)) triggerOf[label] = { card: 'rAppDomain', kind: 'domain' }
  else if (cardByVar.rFe?.options.includes(label)) triggerOf[label] = { card: 'rFe', kind: 'framework' }
  else if (cardByVar.rMobile?.options.includes(label)) triggerOf[label] = { card: 'rMobile', kind: 'mobile' }
  else if (cardByVar.rTarget?.options.includes(label)) triggerOf[label] = { card: 'rTarget', kind: 'target' }
  else triggerOf[label] = { card: null, kind: 'other' }
}

// groups touched per kind (for clear-before-apply)
const groupsByKind = {}
for (const [label, entries] of Object.entries(mergedPresets)) {
  const kind = triggerOf[label].kind
  groupsByKind[kind] ??= []
  for (const e of entries) if (!groupsByKind[kind].includes(e.card)) groupsByKind[kind].push(e.card)
}

// ---------- 8. behaviour mapping (checkbox label -> instruction) ----------
const behaviorMap = {}
{
  const m = /\$behaviorMap\s*=\s*@\{([\s\S]*?)\r?\n\s*\}/.exec(src)
  if (m) {
    const re = /^\s*'((?:[^']|'')*)'\s*=\s*('(?:[^']|'')*'|"(?:[^"\\]|\\.)*")\s*$/gm
    let x
    while ((x = re.exec(m[1]))) behaviorMap[x[1].replace(/''/g, "'")] = parseItems(x[2])[0] ?? ''
  }
  log(`behavior map: ${Object.keys(behaviorMap).length}`)
}

// ---------- 9. templates & functions (raw, for manual porting) ----------
const templateNames = [
  'instrukce', 'persona', 'dbDoc', 'specializationDoc', 'specializedSection', 'mobileSection', 'neonSection',
  'supabaseSection', 'vercelSection', 'tipTapSection', 'legalSection', 'behaviorDoc',
  'agentTaskSection', 'readme', 'contrib', 'envExample'
]
const templates = {}
for (const n of templateNames) {
  const hs = findHereString(n)
  if (hs) {
    templates[n] = hs.body
    fs.writeFileSync(path.join(rawDir, `template_${n}.md`), hs.body, 'utf8')
  } else {
    log(`WARN: here-string not found: ${n}`)
  }
}
log(`templates extracted: ${Object.keys(templates).length}`)

// blocks appended to $domainPersona, in order
{
  const re = /\$domainPersona \+= @"/g
  let m
  let i = 0
  const names = ['domainPersonaEshop', 'domainPersonaBooking', 'domainPersonaSaaS', 'domainPersonaLMS', 'domainPersonaCRM']
  while ((m = re.exec(src)) && i < names.length) {
    const bodyStart = src.indexOf('\n', m.index + m[0].length) + 1
    const closeRe = /^[ \t]*"@[ \t]*$/gm
    closeRe.lastIndex = bodyStart
    const cm = closeRe.exec(src)
    if (!cm) break
    const body = src.slice(bodyStart, cm.index).replace(/\r?\n$/, '')
    templates[names[i]] = body
    fs.writeFileSync(path.join(rawDir, `template_${names[i]}.md`), body, 'utf8')
    i++
  }
  log(`domainPersona blocks: ${i}`)
}

const functionNames = [
  'Get-RoleName', 'Get-TaskSection', 'Get-TaskPrompt', 'Get-RepoStructure', 'Get-WorkflowExamples',
  'Get-AntiPatterns', 'Get-ReviewChecklist', 'Get-BehaviorBullets', 'Get-AgentsMd', 'Get-SetupSteps',
  'Get-SkillBlock', 'Get-AgentTaskMd', 'Get-SkillMd', 'As-Section', 'Polish', 'StackPair', 'Apply-Preset',
  'Get-SafeName', 'Merge-GeneratedContent'
]
const functions = {}
for (const n of functionNames) {
  const f = findFunction(n)
  if (f) {
    functions[n] = f
    fs.writeFileSync(path.join(rawDir, `fn_${n}.ps1`), f, 'utf8')
  } else {
    log(`WARN: function not found: ${n}`)
  }
}
log(`functions extracted: ${Object.keys(functions).length}`)

// ---------- write data ----------
const write = (name, obj) => {
  fs.writeFileSync(path.join(dataDir, name), JSON.stringify(obj, null, 2) + '\n', 'utf8')
  log(`wrote src/data/${name}`)
}

write('tabs.json', { order: tabOrder, pages: tabVarToLabel })
write('cards.json', cards)
write('help.json', help)
write('skills.json', { skills, categorySteps })
write('presets.json', { presets: mergedPresets, triggerOf, groupsByKind, sharedLists })
write('behaviorMap.json', behaviorMap)
fs.writeFileSync(path.join(rawDir, 'report.json'), JSON.stringify(report, null, 2), 'utf8')

// parity summary
const dead = Object.keys(help).filter((k) => {
  const inUi = cards.some((c) => c.options.includes(k))
  const isSkill = skills.some((s) => s.title === k)
  return !inUi && !isSkill
})
log(`help keys not bound to any option: ${dead.length}`)
fs.writeFileSync(path.join(rawDir, 'unbound-help-keys.txt'), dead.sort().join('\n'), 'utf8')

console.log('\nDone.')

// Converts extracted PowerShell here-strings into a TypeScript template module.
// Run: node scripts/to-ts.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const rawDir = path.join(here, 'raw')
const outFile = path.join(root, 'src', 'lib', 'templates.ts')

const BT = '\u0000BT\u0000' // sentinel for an intentional backtick

/** Convert PowerShell interpolation into JS template placeholders. */
function convertInterpolations(text) {
  const manual = []
  let out = text

  // 1) doubled backticks are PowerShell escapes for a literal backtick
  out = out.replace(/``/g, BT)

  // 2) simple member accesses
  out = out.replace(/\$\(\$vals\.(\w+)\)/g, '${v.$1}')
  out = out.replace(/\$\(\$lists\.(\w+)\)/g, '${lists.$1}')
  out = out.replace(/\$\(\$projName\)/g, '${p}')
  out = out.replace(/\$\(\$sk\.(\w+)\)/g, '${sk.$1}')
  out = out.replace(/\$\(\$(\w+Section)\)/g, '${$1}')
  out = out.replace(/\$\(\$domainPersona\)/g, '${domainPersona}')
  out = out.replace(/\$\(\$(\w+)\)/g, '${$1}')

  // 3) helper calls
  out = out.replace(/\$\(As-Section \$(\w+)\)/g, '${asSection($1)}')
  out = out.replace(/\$\(Get-BehaviorBullets \$lists\.(\w+)\)/g, '${behaviorBullets(lists.$1)}')
  out = out.replace(/\$\(StackPair \$vals\.(\w+) \$vals\.(\w+)\)/g, '${stackPair(v.$1, v.$2)}')
  out = out.replace(/\$\(Get-RepoStructure\)/g, '${getRepoStructure()}')
  out = out.replace(/\$\(Get-WorkflowExamples\)/g, '${getWorkflowExamples()}')
  out = out.replace(/\$\(Get-AntiPatterns\)/g, '${getAntiPatterns()}')
  out = out.replace(/\$\(Get-ReviewChecklist\)/g, '${getReviewChecklist()}')
  out = out.replace(/\$\(Get-TaskPrompt\)/g, '${getTaskPrompt()}')

  // 4) report anything left for manual handling
  const left = out.match(/\$\(/g)
  if (left) manual.push(left.length)

  // 5) make the text safe inside a JS template literal
  out = out.replace(/`/g, '\\`')
  out = out.replace(/\$\{/g, (m, off) => (isOwn(out, off) ? m : '\\${'))
  out = out.split(BT).join('\\`')
  return { text: out, manual: manual.reduce((a, b) => a + b, 0) }
}

// our own `${` occurrences were produced above; treat every `${` as ours
function isOwn() { return true }

/** Split a PowerShell here-string body list out of a chunk of code (in order). */
function findHereStrings(code) {
  const res = []
  const re = /@"/g
  let m
  while ((m = re.exec(code))) {
    const bodyStart = code.indexOf('\n', m.index + 2)
    if (bodyStart === -1) break
    const closeRe = /^[ \t]*"@[ \t]*$/gm
    closeRe.lastIndex = bodyStart
    const cm = closeRe.exec(code)
    if (!cm) break
    res.push(code.slice(bodyStart + 1, cm.index))
    re.lastIndex = cm.index
  }
  return res
}

/** Replace the few PowerShell conditionals inside templates with TS expressions. */
function postProcess(name, text) {
  if (name === 'workflowExamplesTpl') {
    text = text.replace(
      /\$\(if \(\$hasValidation\) \{ "((?:[^"\\]|\\.)*)" \} else \{ "((?:[^"\\]|\\.)*)" \}\)/,
      (_m, a, b) => '${hasValidation ? ' + JSON.stringify(a) + ' : ' + JSON.stringify(b) + '}'
    )
  }
  if (name === 'taskPromptTpl') {
    text = text.replace(/\$\(\$stackLines -join "\\`n"\)/, '${stackLines.join("\\n")}')
  }
  if (name === 'agentsMdTpl' || name === 'agentTaskMdTpl') {
    text = text.replace(/\$\(if \(\$modeExtended\) \{ "([\s\S]*?)" \}\)/g, (_m, inner) => {
      const decoded = inner.replace(/\\`n/g, '\n').replace(/\\`/g, '`')
      return '${c.modeExtended ? ' + JSON.stringify(decoded) + " : ''}"
    })
    text = text.replace(/\$\(\$projName\.ToLower\(\) -replace '[^']*','[^']*'\)/g, '${c.slug}')
  }
  if (name === 'setupNodeTpl' || name === 'setupEdgeTpl') {
    // $(if ($usePnpm) { "…" })  ->  ${usePnpm ? "…" : ''}   (decode PS `n escapes)
    text = text.replace(/\$\(if \(\$usePnpm\) \{ "([\s\S]*?)" \}\)/g, (_m, inner) => {
      const decoded = inner.replace(/\\`n/g, '\n').replace(/\\`/g, '`')
      return '${usePnpm ? ' + JSON.stringify(decoded) + " : ''}"
    })
    text = text.replace(
      /\$\(if \(\$usePnpm\) \{ '((?:[^'\\]|\\.)*)' \} else \{ '((?:[^'\\]|\\.)*)' \}\)/g,
      (_m, a, b) => '${usePnpm ? ' + JSON.stringify(a) + ' : ' + JSON.stringify(b) + '}'
    )
  }
  return text
}

/** Qualify identifiers with the context parameter so templates can be functions. */
function qualify(text) {
  return text
    .replace(/\$\{v\./g, '${c.v.')
    .replace(/\$\{lists\./g, '${c.lists.')
    .replace(/\$\{p\}/g, '${c.p}')
    .replace(/\$\{sk\./g, '${c.sk.')
    .replace(/\$\{(\w+Section)\}/g, '${c.$1}')
    .replace(/\$\{domainPersona\}/g, '${c.domainPersona}')
    .replace(/\$\{asSection\(/g, '${c.asSection(')
    .replace(/\$\{behaviorBullets\(/g, '${c.behaviorBullets(')
    .replace(/\$\{stackPair\(/g, '${c.stackPair(')
    .replace(/\$\{usePnpm \?/g, '${c.usePnpm ?')
    .replace(/\$\{hasValidation \?/g, '${c.hasValidation ?')
    .replace(/\$\{stackLines/g, '${c.stackLines')
    .replace(/\(v\./g, '(c.v.')
    .replace(/, v\./g, ', c.v.')
    .replace(/\(lists\./g, '(c.lists.')
    .replace(/, lists\./g, ', c.lists.')
    // bare PowerShell variables used inside templates
    .replace(/\$projName\b/g, '${c.p}')
    .replace(/\$goalText\b/g, '${c.goalText}')
    .replace(/\$fence\b/g, '${c.fence}')
    .replace(/\$taskBody\b/g, '${c.taskBody}')
    .replace(/\$role\b/g, '${c.role}')
    .replace(/\$ci\b/g, '${c.cmdInstall}')
    .replace(/\$cd\b/g, '${c.cmdDev}')
    .replace(/\$cb\b/g, '${c.cmdBuild}')
    .replace(/\$ct\b/g, '${c.cmdTest}')
    .replace(/\$cl\b/g, '${c.cmdLint}')
    .replace(/\$cy\b/g, '${c.cmdTypecheck}')
}

const parts = []
const stats = []

function addConst(name, body, source) {
  const { text: raw, manual } = convertInterpolations(body)
  const text = qualify(postProcess(name, raw))
  const usesCtx = text.includes('${c.')
  const left = (text.match(/\$\(/g) || []).length
  const param = usesCtx ? 'c' : '_c'
  parts.push('/** ' + source + ' */\nexport const ' + name + ' = (' + param + ': GenCtx): string => `' + text + '`')
  stats.push({ name, lines: body.split('\n').length, manual, unresolved: left })
}

// ---------- top level templates ----------
const topLevel = {
  'template_instrukce.md': 'instrukceTpl',
  'template_persona.md': 'personaTpl',
  'template_dbDoc.md': 'dbDocTpl',
  'template_behaviorDoc.md': 'behaviorDocTpl',
  'template_specializationDoc.md': 'specializationDocTpl',
  'template_mobileSection.md': 'mobileSectionTpl',
  'template_neonSection.md': 'neonSectionTpl',
  'template_supabaseSection.md': 'supabaseSectionTpl',
  'template_vercelSection.md': 'vercelSectionTpl',
  'template_tipTapSection.md': 'tipTapSectionTpl',
  'template_legalSection.md': 'legalSectionTpl',
  'template_agentTaskSection.md': 'agentTaskSectionTpl',
  'template_specializedSection.md': 'specializedSectionTpl',
  'template_readme.md': 'readmeTpl',
  'template_contrib.md': 'contribTpl',
  'template_envExample.md': 'envExampleTpl',
  'template_domainPersonaEshop.md': 'domainPersonaEshop',
  'template_domainPersonaBooking.md': 'domainPersonaBooking',
  'template_domainPersonaSaaS.md': 'domainPersonaSaaS',
  'template_domainPersonaLMS.md': 'domainPersonaLMS',
  'template_domainPersonaCRM.md': 'domainPersonaCRM'
}
for (const [file, name] of Object.entries(topLevel)) {
  const p = path.join(rawDir, file)
  if (!fs.existsSync(p)) { stats.push({ name, missing: true }); continue }
  addConst(name, fs.readFileSync(p, 'utf8'), file)
}

// ---------- here-strings inside functions ----------
const functionTemplates = {
  'fn_Get-RepoStructure.ps1': ['repoTreeMonorepo', 'repoTreeNext', 'repoTreeVue', 'repoTreeGeneric'],
  'fn_Get-WorkflowExamples.ps1': ['workflowExamplesTpl'],
  'fn_Get-AntiPatterns.ps1': ['antiPattern1', 'antiPattern2', 'antiPattern3', 'antiPattern4', 'antiPattern5', 'antiPattern6'],
  'fn_Get-TaskPrompt.ps1': ['taskPromptTpl'],
  'fn_Get-AgentsMd.ps1': ['agentsMdTpl'],
  'fn_Get-AgentTaskMd.ps1': ['agentTaskMdTpl'],
  'fn_Get-SetupSteps.ps1': ['setupHeaderTpl', 'setupPythonTpl', 'setupGoTpl', 'setupRustTpl', 'setupEdgeTpl', 'setupNodeTpl']
}
for (const [file, names] of Object.entries(functionTemplates)) {
  const p = path.join(rawDir, file)
  if (!fs.existsSync(p)) { stats.push({ file, missing: true }); continue }
  const code = fs.readFileSync(p, 'utf8')
  const bodies = findHereStrings(code)
  names.forEach((n, i) => {
    if (bodies[i] === undefined) { stats.push({ name: n, missing: true, note: 'no here-string' }); return }
    addConst(n, bodies[i], `${file}[${i}]`)
  })
  if (bodies.length !== names.length) stats.push({ file, note: `here-strings=${bodies.length} names=${names.length}` })
}

const header = `// AUTOGENEROVÁNO skriptem scripts/to-ts.mjs - needituj ručně.
// Zdroj: CopilotBuilderPro2.ps1 (here-stringy převedené na TS šablony).
/* eslint-disable */
import type { GenCtx } from './types'

`

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, header + parts.join('\n\n') + '\n', 'utf8')

console.log(`wrote ${path.relative(root, outFile)} (${parts.length} templates)`)
for (const s of stats) {
  if (s.missing) console.log('  MISSING:', JSON.stringify(s))
  else if (s.unresolved) console.log(`  ${s.name}: UNRESOLVED ${s.unresolved} expressions`)
  else if (s.manual) console.log(`  ${s.name}: ok (${s.manual} conditionals converted)`)
}
fs.writeFileSync(path.join(rawDir, 'to-ts-report.json'), JSON.stringify(stats, null, 2), 'utf8')

// Smoke test: prožene generátor všemi presety a formáty a ověří, že výstup dává smysl.
// Použití: npx tsx scripts/smoke.ts
import { generate } from '../src/lib/generate'
import { applyPreset, cards, emptySelection, optionsFromSelection, presetMap, skills } from '../src/lib/state'
import { defaultSpec, type Project, type Selection } from '../src/lib/types'

const problems: string[] = []
const check = (ok: boolean, message: string) => {
  if (!ok) problems.push(message)
}

/** Minimální volby, které má každý výstup mít. */
function baseSelectionWith(preset: string): Selection {
  let selection = emptySelection()
  selection = applyPreset(selection, preset, false).selection
  // doplňky, které v praxi zaškrtne uživatel
  selection['rSkillOutput'] = selection['rSkillOutput']?.length ? selection['rSkillOutput'] : ['Konsolidovaný (instrukce + agent + setup)']
  selection['rSkillScope'] = selection['rSkillScope']?.length ? selection['rSkillScope'] : ['Vybrané skilly']
  selection['skillGroups'] = skills.slice(0, 6).map((s) => s.title)
  return selection
}

const presets = Object.keys(presetMap)
const formats = ['Konsolidovaný (instrukce + agent + setup)', 'Rozšířený (+ skills a agent-task)', 'Jen instrukce']

for (const preset of presets) {
  const entries = presetMap[preset] ?? []
  check(entries.length > 0, `preset "${preset}" nemá žádné položky`)
  const reachable = entries.every((e) => {
    const card = cards.find((c) => c.id === e.card)
    return card ? e.items.every((i) => card.options.includes(i)) : false
  })
  check(reachable, `preset "${preset}" odkazuje na neexistující kartu nebo volbu`)

  for (const format of formats) {
    const selection = baseSelectionWith(preset)
    selection['rSkillOutput'] = [format]
    const options = optionsFromSelection(selection)
    const project: Project = {
      name: 'SmokeTest',
      goal: 'Ověření generátoru',
      spec: defaultSpec(),
      selection
    }
    const files = generate(project, options)
    const label = `${preset} / ${format}`

    check(files.length > 0, `${label}: žádné soubory`)
    check(
      files.some((f) => f.path === '.github/copilot-instructions.md'),
      `${label}: chybí .github/copilot-instructions.md`
    )
    for (const file of files) {
      check(file.content.trim().length > 0, `${label}: prázdný soubor ${file.path}`)
      check(!file.content.includes('undefined'), `${label}: "undefined" v ${file.path}`)
      check(!file.content.includes('System.Object'), `${label}: "System.Object" v ${file.path}`)
      // eslint-disable-next-line no-control-regex -- kontrola, ze vystup neobsahuje ridici znaky
      check(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(file.content), `${label}: řídicí znak v ${file.path}`)
      check(!/\$\{|\$\(\$/.test(file.content), `${label}: nevyhodnocená interpolace v ${file.path}`)
      if (file.path.endsWith('.json')) {
        try {
          JSON.parse(file.content)
        } catch (error) {
          check(false, `${label}: nevalidní JSON ${file.path} (${String(error)})`)
        }
      }
      if (file.path.endsWith('.md') && /instrukce|AGENTS|SKILL/.test(file.path)) {
        check(file.content.includes('copilot-builder:start'), `${label}: chybí marker v ${file.path}`)
      }
    }
  }
}

// prázdný výběr nesmí spadnout
const emptyOptions = optionsFromSelection(emptySelection())
const emptyFiles = generate({ name: 'Prazdny', goal: '', spec: defaultSpec(), selection: emptySelection() }, emptyOptions)
check(emptyFiles.length > 0, 'prázdný výběr: žádné soubory')

console.log(`presetů: ${presets.length}, skillů: ${skills.length}, karet: ${cards.length}`)
if (problems.length) {
  console.log(`\nproblémy: ${problems.length}`)
  for (const p of problems.slice(0, 30)) console.log(` - ${p}`)
  process.exit(1)
}
console.log('\nsmoke test: vše v pořádku')

// Vygeneruje soubory pomocí TypeScript generátoru (pro paritní test).
// Použití: npx tsx scripts/gen-ts.ts <scenario.json> <outDir>
import fs from 'node:fs'
import path from 'node:path'
import { generate } from '../src/lib/generate'
import { optionsFromSelection } from '../src/lib/state'
import { defaultSpec, type Options, type Project, type Selection } from '../src/lib/types'

const [scenarioPath, outDir] = process.argv.slice(2)
const raw = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'))

const project: Project = {
  name: raw.project.project,
  goal: raw.project.goal,
  spec: { ...defaultSpec(), ...raw.project.spec },
  selection: raw.selection as Selection
}

const options: Options = optionsFromSelection(project.selection)

const files = generate(project, options)
for (const file of files) {
  const target = path.join(outDir, file.path)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, file.content, 'utf8')
}
console.log(`TypeScript: zapsáno ${files.length} souborů do ${outDir}`)

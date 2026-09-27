// Testy generátoru: sada souborů, markery, validita a pomocné funkce.
import test from 'node:test'
import assert from 'node:assert/strict'
import { NOT_REQUIRED, NOT_SPECIFIED, generate, getList, getRadio, getSafeName, polish, stackPair } from './generate'
import { cardById, cards, emptySelection, optionsFromSelection, skills } from './state'
import { defaultSpec, type OutputFormat, type Project, type Selection } from './types'
import { expectedFileCount, filesForFormat } from './ui'

const EM_DASH = '\u2014'

const FORMATS: { label: string; format: OutputFormat }[] = [
  { label: 'Konsolidovaný (instrukce + agent + setup)', format: 'consolidated' },
  { label: 'Rozšířený (+ skills a agent-task)', format: 'extended' },
  { label: 'Jen instrukce', format: 'instructions' }
]

function project(selection: Selection): Project {
  return { name: 'Test projektu', goal: 'Ověřit generátor', spec: defaultSpec(), selection }
}

function selectionFor(formatLabel: string, skillCount: number): Selection {
  const selection = emptySelection()
  selection['rSkillOutput'] = [formatLabel]
  const scope = cardById.get('rSkillScope')
  const selectedScope = scope?.options.find((option) => !/Všechny|Bez skills/.test(option))
  if (selectedScope) selection['rSkillScope'] = [selectedScope]
  selection['skillGroups'] = skills.slice(0, skillCount).map((skill) => skill.title)
  return selection
}

for (const { label, format } of FORMATS) {
  test(`generate ${format}: soubory, markery a validni obsah`, () => {
    const skillCount = 3
    const selection = selectionFor(label, skillCount)
    const options = optionsFromSelection(selection)
    const files = generate(project(selection), options)

    assert.ok(files.length > 0, 'generator vratil soubory')
    assert.equal(files.length, expectedFileCount(format, options, skillCount), 'pocet souboru odpovida odhadu')

    const paths = files.map((file) => file.path)
    assert.equal(new Set(paths).size, paths.length, 'zadna cesta se neopakuje')
    assert.ok(paths.includes('.github/copilot-instructions.md'), 'chybi hlavni instrukce')

    const expected = filesForFormat(format, options, skillCount)
    if (!options.taskPromptFile) {
      assert.deepEqual([...paths].sort(), [...expected].sort(), 'seznam souboru odpovida filesForFormat')
    } else {
      assert.equal(paths.length, expected.length, 'pocet souboru odpovida filesForFormat')
    }
    if (format === 'extended') {
      assert.ok(paths.includes('.github/skills/SKILL.md'), 'rozsireny format ma mit SKILL.md')
      assert.ok(paths.includes('.github/agents/agent-task.agent.md'), 'rozsireny format ma mit agent-task')
    } else {
      assert.ok(!paths.includes('.github/skills/SKILL.md'), 'SKILL.md patri jen do rozsireneho formatu')
    }

    for (const file of files) {
      assert.ok(file.content.trim().length > 0, `${file.path} neni prazdny`)
      assert.ok(!file.content.includes('undefined'), `${file.path} neobsahuje undefined`)
      assert.ok(!file.content.includes('System.Object'), `${file.path} neobsahuje System.Object`)
      if (file.language === 'json') {
        // JSON konfigurace se zamerne nepreklada pres polish() a drzi surove hodnoty jako PowerShell.
        assert.doesNotThrow(() => JSON.parse(file.content), `${file.path} neni validni JSON`)
      } else {
        assert.ok(!file.content.includes(NOT_SPECIFIED), `${file.path} neobsahuje neprelozene ${NOT_SPECIFIED}`)
        assert.ok(file.content.includes('copilot-builder:start'), `${file.path} nema start marker`)
        assert.ok(file.content.includes('copilot-builder:end'), `${file.path} nema end marker`)
      }
    }
  })
}

test('generate se prazdnym vyberem nespadne', () => {
  const selection = emptySelection()
  const files = generate(project(selection), optionsFromSelection(selection))
  assert.ok(files.length > 0)
  assert.ok(files.some((file) => file.path === '.github/copilot-instructions.md'))
})

test('getSafeName ocisti neplatne znaky a prazdny vstup', () => {
  assert.equal(getSafeName('Můj Projekt!'), 'Můj_Projekt!')
  assert.equal(getSafeName('a/b\\c'), 'a_b_c')
  assert.equal(getSafeName('   '), 'EnterpriseProject')
  assert.equal(getSafeName(''), 'EnterpriseProject')
})

test('polish nahradi Nespecifikovano vcetne kombinace s pomlckou', () => {
  assert.equal(polish(`${NOT_SPECIFIED} ${EM_DASH} ${NOT_SPECIFIED}`), 'neuvedeno')
  assert.equal(polish(`pred ${NOT_SPECIFIED} po`), 'pred neuvedeno po')
})

test('stackPair spoji dve hodnoty a preskoci Nespecifikovano', () => {
  assert.equal(stackPair('A', 'B'), 'A + B')
  assert.equal(stackPair('A', NOT_SPECIFIED), 'A')
  assert.equal(stackPair(NOT_SPECIFIED, 'B'), 'B')
  assert.equal(stackPair(NOT_SPECIFIED, NOT_SPECIFIED), NOT_SPECIFIED)
})

test('getRadio vraci prvni volbu nebo Nespecifikovano', () => {
  assert.equal(getRadio({}, 'rArch'), NOT_SPECIFIED)
  assert.equal(getRadio({ rArch: ['X'] }, 'rArch'), 'X')
})

test('getList vraci odrazky v poradi karty nebo poznamku', () => {
  const card = cards.find((entry) => entry.kind === 'check' && entry.options.length >= 2)!
  assert.equal(getList({}, card.id), NOT_REQUIRED)

  const picked = [card.options[1], card.options[0]]
  assert.equal(getList({ [card.id]: picked }, card.id), `- ${card.options[0]}\n- ${card.options[1]}`)
})

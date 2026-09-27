// Testy stavu voleb, presetů a konfigurace.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  applyPreset,
  applyPresetWithTrigger,
  cardById,
  cards,
  emptySelection,
  formatFromLabel,
  fromConfig,
  groupsByKind,
  optionsFromSelection,
  presetMap,
  sanitizeSelection,
  skills,
  toConfig,
  toggleOption,
  triggerOf
} from './state'

const firstRadioWithTwoOptions = cards.find((card) => card.kind === 'radio' && card.options.length >= 2)!
const firstCheckWithTwoOptions = cards.find((card) => card.kind === 'check' && card.options.length >= 2)!

test('toggleOption u radio karty drzi nejvyse jednu volbu a umi odznacit', () => {
  const card = firstRadioWithTwoOptions
  const [first, second] = card.options

  let selection = emptySelection()
  selection = toggleOption(selection, card.id, first)
  assert.deepEqual(selection[card.id], [first])

  selection = toggleOption(selection, card.id, second)
  assert.deepEqual(selection[card.id], [second])

  selection = toggleOption(selection, card.id, second)
  assert.deepEqual(selection[card.id], [])
})

test('toggleOption u check karty volbu prida a znovu odebere', () => {
  const card = firstCheckWithTwoOptions
  const [first, second] = card.options

  let selection = emptySelection()
  selection = toggleOption(selection, card.id, first)
  selection = toggleOption(selection, card.id, second)
  assert.deepEqual(selection[card.id], [first, second])

  selection = toggleOption(selection, card.id, first)
  assert.deepEqual(selection[card.id], [second])
})

test('applyPreset je aditivni, opakovane aplikovani nic neprida', () => {
  const label = Object.keys(presetMap)[0]
  assert.ok(label, 'existuje alespon jeden preset')

  const once = applyPreset(emptySelection(), label, false)
  assert.ok(once.added > 0, `preset "${label}" nepridal zadnou volbu`)

  const twice = applyPreset(once.selection, label, false)
  assert.equal(twice.added, 0, 'druhe aplikovani stejneho presetu uz nic nepridava')
  assert.deepEqual(twice.selection, once.selection)
})

test('applyPreset s clearBefore vycisti skupiny stejneho druhu', () => {
  const label = Object.keys(presetMap)[0]
  const kind = triggerOf[label].kind
  const groups = groupsByKind[kind] ?? []
  const touched = new Set(presetMap[label].map((entry) => entry.card))
  const untouched = groups.filter((group) => !touched.has(group) && (cardById.get(group)?.options.length ?? 0) > 0)
  if (!untouched.length) return // vsechny skupiny preset plni, neni co overit

  const seed = emptySelection()
  for (const group of untouched) seed[group] = [cardById.get(group)!.options[0]]

  const additive = applyPreset(seed, label, false).selection
  const cleared = applyPreset(seed, label, true).selection
  for (const group of untouched) {
    assert.deepEqual(additive[group], [cardById.get(group)!.options[0]], `aditivni rezim meni ${group}`)
    assert.deepEqual(cleared[group], [], `clearBefore nevycistil ${group}`)
  }
})

test('applyPresetWithTrigger nastavi doménu a aplikuje preset', () => {
  const label = 'E-shop / E-commerce'
  assert.ok(presetMap[label], `preset "${label}" existuje`)

  const first = applyPresetWithTrigger(emptySelection(), label, 'rAppDomain', false)
  assert.deepEqual(first.selection['rAppDomain'], [label], 'doména se zapíše do radio karty')
  assert.ok(first.added > 0, 'preset neco pridal')

  const second = applyPresetWithTrigger(first.selection, label, 'rAppDomain', false)
  assert.equal(second.added, 0, 'opakovane volani uz nic nepridava')
  assert.deepEqual(second.selection, first.selection)
})

test('applyPresetWithTrigger zapise i volbu bez presetu', () => {
  const domainCard = cardById.get('rAppDomain')!
  const withoutPreset = domainCard.options.find((option) => !presetMap[option])
  if (!withoutPreset) return

  const result = applyPresetWithTrigger(emptySelection(), withoutPreset, 'rAppDomain', false)
  assert.deepEqual(result.selection['rAppDomain'], [withoutPreset])
})

test('formatFromLabel mapuje popisky formatu', () => {
  assert.equal(formatFromLabel('Konsolidovaný (instrukce + agent + setup)'), 'consolidated')
  assert.equal(formatFromLabel('Rozšířený (+ skills a agent-task)'), 'extended')
  assert.equal(formatFromLabel('Jen instrukce'), 'instructions')
})

test('optionsFromSelection odvodi format, rozsah skills a prepinace', () => {
  const output = cardById.get('rSkillOutput')!
  const scope = cardById.get('rSkillScope')!
  const content = cardById.get('cSkillContent')!
  const files = cardById.get('cProjectFiles')!

  const selection = emptySelection()
  selection['rSkillOutput'] = [output.options.find((o) => /Rozšířený/.test(o))!]
  selection['rSkillScope'] = [scope.options.find((o) => /Všechny/.test(o))!]
  selection['cSkillContent'] = [content.options.find((o) => /checklist/.test(o))!]
  selection['cProjectFiles'] = [files.options.find((o) => /PROJECT_PLAN/.test(o))!]

  const options = optionsFromSelection(selection)
  assert.equal(options.format, 'extended')
  assert.equal(options.skillScope, 'all')
  assert.equal(options.skillChecklist, true)
  assert.equal(options.skillExample, false)
  assert.equal(options.projectPlan, true)
  assert.equal(options.manifest, false)
  assert.equal(options.contributing, false)
})

test('toConfig a fromConfig zachovaji vyber vcetne skills', () => {
  const selection = emptySelection()
  for (const card of cards) {
    if (card.dynamic || card.options.length === 0) continue
    selection[card.id] = card.kind === 'radio' ? [card.options[0]] : card.options.slice(0, 2)
  }
  selection['skillGroups'] = skills.slice(0, 3).map((skill) => skill.title)

  const options = optionsFromSelection(selection)
  const config = toConfig('Test', 'cíl', {}, options, selection)
  const restored = sanitizeSelection(fromConfig(config))

  for (const card of cards) {
    if (card.dynamic) continue
    assert.deepEqual(restored[card.id], selection[card.id], `karta ${card.id}`)
  }
  assert.deepEqual([...restored['skillGroups']].sort(), [...selection['skillGroups']].sort())
})

test('sanitizeSelection zahodi neznamy karty, neplatne volby a druhou hodnotu u radio', () => {
  const radio = firstRadioWithTwoOptions
  const cleaned = sanitizeSelection({
    [radio.id]: [radio.options[0], radio.options[1]],
    'neexistujiciKarta': ['cokoliv'],
    skillGroups: ['Neexistujici skill', skills[0].title]
  })
  assert.deepEqual(cleaned[radio.id], [radio.options[0]])
  assert.equal(cleaned['neexistujiciKarta'], undefined)
  assert.deepEqual(cleaned['skillGroups'], [skills[0].title])
})

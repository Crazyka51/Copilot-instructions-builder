// Testy integrity dat extrahovaných z PowerShell skriptu.
import test from 'node:test'
import assert from 'node:assert/strict'
import skillsData from '../data/skills.json'
import { helpFor } from './help'
import { cardById, cards, presetMap, skills } from './state'
import { TAB_GROUPS, tabs } from './ui'

test('kazda volba karty ma text napovedy', () => {
  const missing: string[] = []
  for (const card of cards) {
    for (const option of card.options) {
      if (!helpFor(option)) missing.push(`${card.id}: ${option}`)
    }
  }
  assert.deepEqual(missing, [], 'kazda volba musi mit napovedu (doplnit do scripts/patches.json)')
})

test('kazdy preset odkazuje na existujici kartu a existujici volbu', () => {
  const problems: string[] = []
  for (const [label, entries] of Object.entries(presetMap)) {
    for (const entry of entries) {
      const card = cardById.get(entry.card)
      if (!card) {
        problems.push(`${label}: neznama karta ${entry.card}`)
        continue
      }
      for (const item of entry.items) {
        if (!card.options.includes(item)) problems.push(`${label}: ${entry.card} nema volbu "${item}"`)
      }
    }
  }
  assert.deepEqual(problems, [])
})

test('karty maji unikatni id, konfiguracni klic a volby', () => {
  const ids = new Set<string>()
  const keys = new Set<string>()
  const problems: string[] = []
  for (const card of cards) {
    if (ids.has(card.id)) problems.push(`duplicitni id ${card.id}`)
    ids.add(card.id)
    const key = `${card.tab}|${card.title}`
    if (keys.has(key)) problems.push(`duplicitni klic ${key}`)
    keys.add(key)
    const seen = new Set<string>()
    for (const option of card.options) {
      if (seen.has(option)) problems.push(`${card.id}: duplicitni volba ${option}`)
      seen.add(option)
    }
  }
  assert.deepEqual(problems, [])
})

test('kazda zalozka karet existuje v navigaci', () => {
  const labels = new Set(tabs.map((tab) => tab.label))
  const missing = [...new Set(cards.map((card) => card.tab))].filter((tab) => !labels.has(tab))
  assert.deepEqual(missing, [])
})

test('kazda zalozka je zarazena do skupiny navigace', () => {
  const grouped = new Set(TAB_GROUPS.flatMap((group) => group.tabs))
  const missing = tabs.map((tab) => tab.label).filter((label) => !grouped.has(label))
  assert.deepEqual(missing, [])
})

test('skills maji unikatni slug a kategorii s postupem', () => {
  const categorySteps = skillsData.categorySteps as Record<string, string[]>
  const slugs = new Set<string>()
  const problems: string[] = []
  for (const skill of skills) {
    if (slugs.has(skill.slug)) problems.push(`duplicitni slug ${skill.slug}`)
    slugs.add(skill.slug)
    if (!(categorySteps[skill.category] ?? []).length) problems.push(`${skill.title}: kategorie ${skill.category} nema postup`)
    if (!skill.description) problems.push(`${skill.title}: chybi popis`)
  }
  assert.deepEqual(problems, [])
})

test('kazdy typ presetu ma definovane skupiny pro clearBefore', () => {
  const problems: string[] = []
  for (const [label, entries] of Object.entries(presetMap)) {
    if (!entries.length) problems.push(`${label}: preset nema zadne polozky`)
  }
  assert.deepEqual(problems, [])
})

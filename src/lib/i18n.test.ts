// Testy úplnosti anglické lokalizace.
//
// Hlídají, že každý text, který se v aplikaci zobrazuje, má anglickou podobu.
// Když se do dat přidá nová volba nebo skill, tenhle test spadne a je vidět,
// co je potřeba přeložit.
import test from 'node:test'
import assert from 'node:assert/strict'
import cardsData from '../data/cards.json'
import skillsData from '../data/skills.json'
import tabsData from '../data/tabs.json'
import helpData from '../data/help.json'
import { en, enContent, enSkills, enUi } from '../i18n'
import { enHelp } from '../i18n/help.en'

interface CardLike {
  title: string
  options: string[]
}

interface SkillLike {
  title: string
  category: string
  description: string
}

const cards = cardsData as CardLike[]
const skills = skillsData.skills as SkillLike[]

function withoutTranslation(labels: string[]): string[] {
  return labels.filter((label) => !en[label])
}

test('každý název volby má anglický překlad', () => {
  const options = [...new Set(cards.flatMap((card) => card.options))]
  assert.deepEqual(withoutTranslation(options), [])
})

test('každý název karty má anglický překlad', () => {
  const titles = [...new Set(cards.map((card) => card.title))]
  assert.deepEqual(withoutTranslation(titles), [])
})

test('každá záložka má anglický překlad', () => {
  const labels = (tabsData as { order: { label: string }[] }).order.map((tab) => tab.label)
  assert.deepEqual(withoutTranslation(labels), [])
})

test('katalog skills je přeložený celý', () => {
  const labels = [
    ...skills.map((skill) => skill.title),
    ...skills.map((skill) => skill.category),
    ...skills.map((skill) => skill.description)
  ]
  assert.deepEqual(withoutTranslation([...new Set(labels)]), [])
})

test('slovníky nemají u stejného klíče rozdílné hodnoty', () => {
  const dicts: Record<string, Record<string, string>> = { enContent, enSkills, enUi }
  const seen = new Map<string, { value: string; file: string }>()
  const conflicts: string[] = []

  for (const [file, dict] of Object.entries(dicts)) {
    for (const [key, value] of Object.entries(dict)) {
      const previous = seen.get(key)
      if (!previous) {
        seen.set(key, { value, file })
      } else if (previous.value !== value) {
        conflicts.push(`${key}: ${previous.file}="${previous.value}" vs ${file}="${value}"`)
      }
    }
  }

  assert.deepEqual(conflicts, [])
})

test('žádná anglická hodnota není prázdná', () => {
  const empty = Object.entries(en)
    .filter(([, value]) => !value.trim())
    .map(([key]) => key)
  assert.deepEqual(empty, [])
})

test('klíče v enHelp odpovídají zdroji nápovědy', () => {
  const known = new Set(Object.keys(helpData as Record<string, string>))
  const unknown = Object.keys(enHelp).filter((key) => !known.has(key))
  assert.deepEqual(unknown, [], 'překlad nápovědy nesmí odkazovat na neexistující klíč')
})

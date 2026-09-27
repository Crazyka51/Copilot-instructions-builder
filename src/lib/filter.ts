// Filtrování karet a voleb podle hledaného výrazu.
import type { Card } from './types'
import { helpFor } from './help'

/** Volby karty odpovídající dotazu (hledá se v názvu volby i v textu nápovědy). */
export function matchOptions(card: Card, query: string): string[] {
  const q = query.trim().toLocaleLowerCase('cs')
  if (!q) return card.options
  return card.options.filter(
    (option) => option.toLocaleLowerCase('cs').includes(q) || helpFor(option).toLocaleLowerCase('cs').includes(q)
  )
}

/** Odpovídá karta dotazu? (shoda v názvu karty nebo alespoň v jedné volbě) */
export function cardMatches(card: Card, query: string): boolean {
  const q = query.trim().toLocaleLowerCase('cs')
  if (!q) return true
  if (card.title.toLocaleLowerCase('cs').includes(q)) return true
  return matchOptions(card, query).length > 0
}

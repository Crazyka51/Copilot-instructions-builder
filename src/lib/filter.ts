// Filtrování karet a voleb podle hledaného výrazu.
import type { Card } from './types'
import { helpFor } from './help'

/**
 * Doplňkový text pro hledání. Slouží k tomu, aby filtr našel i přeložené
 * popisky a nápovědu, ne jen původní české hodnoty.
 */
export type ExtraText = (text: string) => string

function haystack(text: string, extra?: ExtraText): string {
  return `${text} ${extra?.(text) ?? ''}`.toLocaleLowerCase('cs')
}

/** Volby karty odpovídající dotazu (hledá se v názvu volby i v textu nápovědy). */
export function matchOptions(card: Card, query: string, extra?: ExtraText): string[] {
  const q = query.trim().toLocaleLowerCase('cs')
  if (!q) return card.options
  return card.options.filter(
    (option) => haystack(option, extra).includes(q) || haystack(helpFor(option), extra).includes(q)
  )
}

/** Odpovídá karta dotazu? (shoda v názvu karty nebo alespoň v jedné volbě) */
export function cardMatches(card: Card, query: string, extra?: ExtraText): boolean {
  const q = query.trim().toLocaleLowerCase('cs')
  if (!q) return true
  if (haystack(card.title, extra).includes(q)) return true
  return matchOptions(card, query, extra).length > 0
}

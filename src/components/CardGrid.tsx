import { CardView } from './CardView'
import { cards } from '../lib/state'
import { cardMatches } from '../lib/filter'
import { staggerStyle } from '../lib/ui'
import type { Selection } from '../lib/types'

/** Mřížka karet jedné záložky s volitelným filtrem. */
export function CardGrid({
  tab,
  selection,
  query,
  onSelect,
  onSelectAll,
  onClearCard
}: {
  tab: string
  selection: Selection
  query: string
  onSelect: (cardId: string, option: string) => void
  onSelectAll: (cardId: string) => void
  onClearCard: (cardId: string) => void
}) {
  const visible = cards.filter((card) => card.tab === tab && !card.dynamic && cardMatches(card, query))

  if (!cards.some((card) => card.tab === tab && !card.dynamic)) {
    return <div className="empty-state">Tato záložka neobsahuje žádné volby.</div>
  }
  if (!visible.length) {
    return <div className="empty-state">Nic nenalezeno. Zkuste jiný výraz, nebo filtr vyčistěte.</div>
  }

  return (
    <div className="grid">
      {visible.map((card, index) => (
        <CardView
          key={card.id}
          card={card}
          selected={selection[card.id] ?? []}
          query={query}
          style={staggerStyle(index)}
          onSelect={(option) => onSelect(card.id, option)}
          onSelectAll={() => onSelectAll(card.id)}
          onClear={() => onClearCard(card.id)}
        />
      ))}
    </div>
  )
}

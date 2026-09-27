import { CardGrid } from './CardGrid'
import { formatLabel } from '../lib/ui'
import type { OutputFormat, Selection } from '../lib/types'

/** Záložka Projekt: přehled generovaných souborů a projektové volby. */
export function ProjectTab({
  selection,
  query,
  format,
  files,
  onSelect,
  onSelectAll,
  onClearCard
}: {
  selection: Selection
  query: string
  format: OutputFormat
  files: string[]
  onSelect: (cardId: string, option: string) => void
  onSelectAll: (cardId: string) => void
  onClearCard: (cardId: string) => void
}) {
  return (
    <>
      <div className="notes info">
        <strong>Aktuální formát výstupu: {formatLabel(format)}</strong>
        <p className="notes-lead">Vygeneruje se {files.length} souborů:</p>
        <ul>
          {files.map((file) => (
            <li key={file}>
              <code>{file}</code>
            </li>
          ))}
        </ul>
      </div>

      <CardGrid
        tab="Projekt"
        selection={selection}
        query={query}
        onSelect={onSelect}
        onSelectAll={onSelectAll}
        onClearCard={onClearCard}
      />
    </>
  )
}

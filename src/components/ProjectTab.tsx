import { CardGrid } from './CardGrid'
import { useI18n } from '../i18n'
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
  const { t } = useI18n()

  return (
    <>
      <div className="notes info">
        <strong>{t('Aktuální formát výstupu: {format}', { format: t(formatLabel(format)) })}</strong>
        <p className="notes-lead">{t('Vygeneruje se {count} souborů:', { count: files.length })}</p>
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

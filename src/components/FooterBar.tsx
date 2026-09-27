import { formatLabel } from '../lib/ui'
import type { OutputFormat } from '../lib/types'

/** Spodní lišta se souhrnem a hlavní akcí. */
export function FooterBar({
  totalChecked,
  fileCount,
  format,
  canClearTab,
  onClearTab,
  onGenerate
}: {
  totalChecked: number
  fileCount: number
  format: OutputFormat
  canClearTab: boolean
  onClearTab: () => void
  onGenerate: () => void
}) {
  return (
    <footer className="footer-bar">
      <span className="hint">
        Vybráno <strong>{totalChecked}</strong> voleb · formát <code>{formatLabel(format)}</code> · vygeneruje se{' '}
        <strong>{fileCount}</strong> souborů
      </span>

      <div className="grow" />

      <button type="button" className="btn btn-sm" onClick={onClearTab} disabled={!canClearTab}>
        Vyčistit záložku
      </button>
      <button type="button" className="btn btn-primary btn-sm" onClick={onGenerate}>
        Vygenerovat soubory
      </button>
    </footer>
  )
}

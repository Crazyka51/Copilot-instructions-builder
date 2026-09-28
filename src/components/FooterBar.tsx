import { useI18n } from '../i18n'
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
  const { t } = useI18n()

  return (
    <footer className="footer-bar">
      <span className="hint">
        {t('Vybráno {count} voleb', { count: totalChecked })} ·{' '}
        {t('formát {format}', { format: t(formatLabel(format)) })} ·{' '}
        {t('vygeneruje se {count} souborů', { count: fileCount })}
      </span>

      <div className="grow" />

      <button type="button" className="btn btn-sm" onClick={onClearTab} disabled={!canClearTab}>
        {t('Vyčistit záložku')}
      </button>
      <button type="button" className="btn btn-primary btn-sm" onClick={onGenerate}>
        {t('Vygenerovat soubory')}
      </button>
    </footer>
  )
}

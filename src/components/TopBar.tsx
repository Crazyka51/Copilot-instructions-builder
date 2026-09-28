import { useI18n } from '../i18n'
import { LANGUAGES } from '../i18n/types'
import { formatLabel } from '../lib/ui'
import type { OutputFormat } from '../lib/types'

/** Horní lišta: název projektu pro kontext, stav a hlavní akce. */
export function TopBar({
  projectName,
  totalChecked,
  format,
  onSave,
  onLoad,
  onReset,
  onGenerate
}: {
  projectName: string
  totalChecked: number
  format: OutputFormat
  onSave: () => void
  onLoad: (file: File) => void
  onReset: () => void
  onGenerate: () => void
}) {
  const { t, lang, setLang } = useI18n()

  return (
    <header className="topbar">
      <div className="brand">
        <h1>
          Copilot <span>Instructions Builder</span>
        </h1>
        <span className="version">v1.1</span>
      </div>

      {/* Jen pro kontext. Název se zadává v průvodci, aby nebyl na dvou místech. */}
      <span className="topbar-project" title={t('Název projektu. Nastavíte ho v průvodci.')}>
        {projectName || t('Název projektu')}
      </span>

      <div className="grow" />

      <span className="topbar-status">
        <strong>{totalChecked}</strong> {t('voleb')} · <code>{t(formatLabel(format))}</code>
      </span>

      <div className="lang-switch" role="group" aria-label={t('Jazyk rozhraní')}>
        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            type="button"
            className={language.code === lang ? 'on' : ''}
            aria-pressed={language.code === lang}
            title={`${t('Přepnout jazyk')}: ${language.nativeName}`}
            onClick={() => setLang(language.code)}
          >
            {language.short}
          </button>
        ))}
      </div>

      <div className="topbar-actions">
        <button type="button" className="btn" onClick={onSave} title={t('Uloží volby do souboru builder-config.json')}>
          {t('Uložit konfiguraci')}
        </button>
        <label className="btn btn-file" title={t('Načte volby ze souboru builder-config.json')}>
          {t('Načíst konfiguraci')}
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onLoad(file)
              e.target.value = ''
            }}
          />
        </label>
        <button type="button" className="btn" onClick={onReset} title={t('Smaže všechny volby a vrátí výchozí stav')}>
          {t('Reset')}
        </button>
        <button type="button" className="btn btn-primary" onClick={onGenerate}>
          {t('Vygenerovat soubory')}
        </button>
      </div>
    </header>
  )
}

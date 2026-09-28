import { useI18n } from '../i18n'

/** Kontextová lišta nad obsahem záložky: název, filtr a hromadné akce. */
export function TabHeader({
  title,
  count,
  query,
  showSearch,
  onQuery,
  onClearTab
}: {
  title: string
  count: number
  query: string
  showSearch: boolean
  onQuery: (value: string) => void
  onClearTab?: () => void
}) {
  const { t } = useI18n()

  return (
    <div className="tab-header">
      <div className="tab-header-title">
        <h2>{t(title)}</h2>
        {count > 0 && <span className="pill">{count}</span>}
      </div>

      <div className="grow" />

      {showSearch && (
        <div className="search">
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t('Hledat volbu nebo nápovědu…')}
            aria-label={t('Hledat volbu nebo nápovědu')}
          />
          {query && (
            <button type="button" className="btn btn-sm" onClick={() => onQuery('')}>
              {t('Zrušit')}
            </button>
          )}
        </div>
      )}

      {onClearTab && (
        <button type="button" className="btn btn-sm" onClick={onClearTab}>
          {t('Vyčistit záložku')}
        </button>
      )}
    </div>
  )
}

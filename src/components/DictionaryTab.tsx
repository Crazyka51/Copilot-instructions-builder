import { useState } from 'react'
import { useI18n } from '../i18n'
import { filterHelpKeys, helpCount, helpFor } from '../lib/help'

/** Záložka Slovník: procházení a hledání v nápovědě voleb. */
export function DictionaryTab() {
  const { t, help } = useI18n()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const extra = (text: string) => t(text)
  const keys = filterHelpKeys(query, extra)
  const current = selected && keys.includes(selected) ? selected : keys[0] ?? null
  const text = current ? help(current, helpFor(current)) : ''

  return (
    <section className="panel">
      <h2>{t('Slovník nápovědy ({count})', { count: helpCount })}</h2>
      <p className="lead">
        {t('Vyhledejte volbu a zobrazí se plné vysvětlení. Stejný text se zobrazuje i v tooltipu u voleb.')}
      </p>

      <div className="search dict-search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Hledat v nápovědě…')}
          aria-label={t('Hledat v nápovědě')}
        />
        {query && (
          <button type="button" className="btn btn-sm" onClick={() => setQuery('')}>
            {t('Zrušit')}
          </button>
        )}
        <span className="muted">{t('{count} položek', { count: keys.length })}</span>
      </div>

      <div className="dict">
        <div className="dict-list" role="listbox" aria-label={t('Položky nápovědy')}>
          {keys.map((key) => (
            <button
              key={key}
              type="button"
              role="option"
              aria-selected={key === current}
              className={key === current ? 'on' : ''}
              onClick={() => setSelected(key)}
            >
              {t(key)}
            </button>
          ))}
          {!keys.length && <div className="dict-empty">{t('Nic nenalezeno')}</div>}
        </div>

        <article className="dict-detail">
          {current ? (
            <>
              <h3>{t(current)}</h3>
              <pre className="dict-text">{text}</pre>
            </>
          ) : (
            <span className="muted">{t('Vyberte položku ze seznamu.')}</span>
          )}
        </article>
      </div>
    </section>
  )
}

import { useMemo, useState } from 'react'
import { filterHelpKeys, helpCount, helpFor } from '../lib/help'

/** Záložka Slovník: procházení a hledání v nápovědě voleb. */
export function DictionaryTab() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const keys = useMemo(() => filterHelpKeys(query), [query])
  const current = selected && keys.includes(selected) ? selected : keys[0] ?? null
  const text = current ? helpFor(current) : ''

  return (
    <section className="panel">
      <h2>Slovník nápovědy ({helpCount})</h2>
      <p className="lead">Vyhledejte volbu a zobrazí se plné vysvětlení. Stejný text se zobrazuje i v tooltipu u voleb.</p>

      <div className="search dict-search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hledat v nápovědě…"
          aria-label="Hledat v nápovědě"
        />
        {query && (
          <button type="button" className="btn btn-sm" onClick={() => setQuery('')}>
            Zrušit
          </button>
        )}
        <span className="muted">{keys.length} položek</span>
      </div>

      <div className="dict">
        <div className="dict-list" role="listbox" aria-label="Položky nápovědy">
          {keys.map((key) => (
            <button
              key={key}
              type="button"
              role="option"
              aria-selected={key === current}
              className={key === current ? 'on' : ''}
              onClick={() => setSelected(key)}
            >
              {key}
            </button>
          ))}
          {!keys.length && <div className="dict-empty">Nic nenalezeno</div>}
        </div>

        <article className="dict-detail">
          {current ? (
            <>
              <h3>{current}</h3>
              <pre className="dict-text">{text}</pre>
            </>
          ) : (
            <span className="muted">Vyberte položku ze seznamu.</span>
          )}
        </article>
      </div>
    </section>
  )
}

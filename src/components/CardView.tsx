import type { CSSProperties } from 'react'
import { useI18n } from '../i18n'
import { helpFor } from '../lib/help'
import { matchOptions } from '../lib/filter'
import type { Card } from '../lib/types'

/** Karta s volbami (radio nebo checkbox) včetně nápověd a akcí. */
export function CardView({
  card,
  selected,
  query = '',
  style,
  onSelect,
  onSelectAll,
  onClear
}: {
  card: Card
  selected: string[]
  query?: string
  style?: CSSProperties
  onSelect: (option: string) => void
  onSelectAll?: () => void
  onClear?: () => void
}) {
  const single = card.kind === 'radio'
  const { t, help } = useI18n()
  const extra = (text: string) => `${t(text)} ${help(text, helpFor(text))}`
  const options = matchOptions(card, query, extra)
  const checkedCount = card.options.filter((o) => selected.includes(o)).length

  return (
    <section className="card" style={style}>
      <header className="card-head">
        <h3>{t(card.title)}</h3>
        <span className={single ? 'badge' : 'badge badge-alt'}>
          {t(single ? 'jedna volba' : 'více voleb')}
        </span>
        <span className="grow" />
        <span className="card-count" title={t('Vybrané volby z celku')}>
          {checkedCount}/{card.options.length}
        </span>
      </header>

      <p className="hint">
        {t(single ? 'Volitelné: vyberte jednu možnost, nebo nechte nevybráno.' : 'Volitelné moduly a integrace.')}
      </p>

      <div className="opts">
        {options.map((option) => {
          const on = selected.includes(option)
          const tip = help(option, helpFor(option))
          return (
            <label key={option} className={on ? 'opt on' : 'opt'} title={tip || undefined}>
              <input type={single ? 'radio' : 'checkbox'} checked={on} onChange={() => onSelect(option)} />
              <span>{t(option)}</span>
            </label>
          )
        })}
        {!options.length && <p className="empty">{t('Žádná volba neodpovídá filtru.')}</p>}
      </div>

      {(onClear || (!single && onSelectAll)) && (
        <footer className="card-actions">
          {!single && onSelectAll && (
            <button type="button" className="btn btn-sm" onClick={onSelectAll}>
              {t('Vybrat vše')}
            </button>
          )}
          {onClear && (
            <button type="button" className="btn btn-sm" onClick={onClear} disabled={checkedCount === 0}>
              {t('Vyčistit')}
            </button>
          )}
        </footer>
      )}
    </section>
  )
}

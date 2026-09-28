import { useI18n } from '../i18n'
import { TAB_GROUPS } from '../lib/ui'
import type { TabDef } from '../lib/types'

/** Levý panel s rozdělením záložek do skupin a ukazatelem průběhu. */
export function Sidebar({
  tabs,
  active,
  counts,
  totalChecked,
  totalOptions,
  onSelect
}: {
  tabs: TabDef[]
  active: string
  counts: Record<string, number>
  totalChecked: number
  totalOptions: number
  onSelect: (tab: string) => void
}) {
  const { t } = useI18n()
  const percent = totalOptions ? Math.min(100, Math.round((totalChecked / totalOptions) * 100)) : 0

  return (
    <nav className="sidebar" aria-label={t('Záložky průvodce')}>
      <div className="sidebar-progress">
        <div className="sidebar-progress-text">
          <span>{t('Vybrané volby')}</span>
          <strong>
            {totalChecked}
            <span className="muted">/{totalOptions}</span>
          </strong>
        </div>
        <div
          className="bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalOptions}
          aria-valuenow={totalChecked}
          aria-label={t('Počet vybraných voleb')}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>

      {TAB_GROUPS.map((group) => {
        const groupTabs = group.tabs
          .map((label) => tabs.find((tab) => tab.label === label))
          .filter((tab): tab is TabDef => Boolean(tab))
        if (!groupTabs.length) return null
        return (
          <div className="nav-group" key={group.label}>
            <div className="nav-group-label">{t(group.label)}</div>
            {groupTabs.map((tab) => {
              const count = counts[tab.label] ?? 0
              const isActive = tab.label === active
              return (
                <button
                  key={tab.label}
                  type="button"
                  className={isActive ? 'active' : ''}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onSelect(tab.label)}
                >
                  <span className="nav-label">
                    <span className="icon" aria-hidden="true">
                      {tab.icon}
                    </span>
                    {t(tab.label)}
                  </span>
                  {count > 0 && <span className="count">{count}</span>}
                </button>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}

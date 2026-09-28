import { CardGrid } from './CardGrid'
import { useI18n } from '../i18n'
import { skills } from '../lib/state'
import { helpFor } from '../lib/help'
import { staggerStyle } from '../lib/ui'
import type { Selection } from '../lib/types'

/** Záložka Skills: volby skillů plus knihovna postupů podle kategorií. */
export function SkillsTab({
  selection,
  query,
  onSelect,
  onSelectAll,
  onClearCard,
  onToggleSkill,
  onSetSkills
}: {
  selection: Selection
  query: string
  onSelect: (cardId: string, option: string) => void
  onSelectAll: (cardId: string) => void
  onClearCard: (cardId: string) => void
  onToggleSkill: (title: string) => void
  onSetSkills: (titles: string[]) => void
}) {
  const checked = selection['skillGroups'] ?? []
  const { t, help } = useI18n()
  const categories = [...new Set(skills.map((skill) => skill.category))]
  const allChecked = checked.length === skills.length

  return (
    <>
      <CardGrid
        tab="Skills"
        selection={selection}
        query={query}
        onSelect={onSelect}
        onSelectAll={onSelectAll}
        onClearCard={onClearCard}
      />

      <section className="panel">
        <header className="panel-head">
          <h2>{t('Knihovna skills ({count})', { count: skills.length })}</h2>
          <div className="grow" />
          <button type="button" className="btn btn-sm" onClick={() => onSetSkills(allChecked ? [] : skills.map((skill) => skill.title))}>
            {t(allChecked ? 'Odznačit všechny' : 'Vybrat všechny')}
          </button>
        </header>
        <p className="lead">
          {t('Vyberte postupy, které se vloží do instrukcí. Najeďte na název pro popis. Vybraných: {count}.', {
            count: checked.length
          })}
        </p>

        {categories.map((category) => {
          const inCategory = skills.filter((skill) => skill.category === category)
          const checkedInCategory = inCategory.filter((skill) => checked.includes(skill.title)).length
          return (
            <div className="skill-category" key={category}>
              <div className="skill-category-head">
                <span className="skill-category-label">{t(category)}</span>
                <span className="muted">
                  {checkedInCategory}/{inCategory.length}
                </span>
              </div>
              <div className="chips">
                {inCategory.map((skill, index) => {
                  const on = checked.includes(skill.title)
                  return (
                    <button
                      key={skill.slug}
                      type="button"
                      className={on ? 'chip on' : 'chip'}
                      title={help(skill.title, helpFor(skill.title) || skill.description)}
                      style={staggerStyle(index)}
                      aria-pressed={on}
                      onClick={() => onToggleSkill(skill.title)}
                    >
                      {on && (
                        <span className="chip-check" aria-hidden="true">
                          ✓
                        </span>
                      )}
                      {t(skill.title)}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>
    </>
  )
}

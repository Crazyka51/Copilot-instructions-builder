import { cardById, cards, triggerOf } from '../lib/state'
import { helpFor } from '../lib/help'
import { PRESET_MIRROR, WIZARD_STEPS, formatLabel, staggerStyle } from '../lib/ui'
import type { OutputFormat, Selection, Spec } from '../lib/types'

/** Záložka Presety: průvodce krok za krokem plus rychlé šablony. */
export function PresetsTab({
  step,
  onStep,
  selection,
  onChooseTrigger,
  onToggleOption,
  projectName,
  onProjectName,
  goal,
  onGoal,
  spec,
  onSpec,
  totalChecked,
  format,
  onGenerate
}: {
  step: number
  onStep: (step: number) => void
  selection: Selection
  onChooseTrigger: (label: string, fallbackCardId: string) => void
  onToggleOption: (cardId: string, option: string) => void
  projectName: string
  onProjectName: (value: string) => void
  goal: string
  onGoal: (value: string) => void
  spec: Spec
  onSpec: (spec: Spec) => void
  totalChecked: number
  format: OutputFormat
  onGenerate: () => void
}) {
  const radio = (cardId: string) => selection[cardId]?.[0] ?? ''
  const optionsOf = (cardId: string) => cardById.get(cardId)?.options ?? []
  const presetCards = cards.filter((card) => card.tab === 'Presety' && !card.dynamic)
  const canNext = step !== 0 || projectName.trim().length > 0
  const isLast = step === WIZARD_STEPS.length - 1

  const select = (id: string, label: string, cardId: string) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={radio(cardId)} onChange={(e) => e.target.value && onChooseTrigger(e.target.value, cardId)}>
        <option value="">- nevybráno -</option>
        {optionsOf(cardId).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <>
      <section className="panel">
        <h2>Průvodce založením projektu</h2>
        <p className="lead">
          Projděte krok za krokem. Volby se propisují do ostatních záložek a doporučené moduly se předvyplní podle presetu.
        </p>

        <ol className="wizard-steps">
          {WIZARD_STEPS.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                className={index === step ? 'on' : index < step ? 'done' : ''}
                aria-current={index === step ? 'step' : undefined}
                onClick={() => onStep(index)}
              >
                <span className="step-index" aria-hidden="true">
                  {index + 1}
                </span>
                {label}
              </button>
            </li>
          ))}
        </ol>
        <div className="wizard-progress" aria-hidden="true">
          <span style={{ width: `${((step + 1) / WIZARD_STEPS.length) * 100}%` }} />
        </div>

        {step === 0 && (
          <div className="row">
            <div className="field">
              <label htmlFor="wiz-name">Název projektu</label>
              <input id="wiz-name" type="text" value={projectName} onChange={(e) => onProjectName(e.target.value)} />
            </div>
            <div className="field wide">
              <label htmlFor="wiz-goal">Co má projekt řešit?</label>
              <textarea
                id="wiz-goal"
                rows={4}
                value={goal}
                onChange={(e) => onGoal(e.target.value)}
                placeholder="Popište výsledek vlastními slovy. Text se uloží do PROJECT_PLAN.md a README.md."
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="row">
            {select('wiz-domain', 'Doména projektu', 'rAppDomain')}
            {select('wiz-target', 'Cílová platforma', 'rTarget')}
          </div>
        )}

        {step === 2 && (
          <div className="row">
            {select('wiz-fe', 'Frontend framework', 'rFe')}
            {select('wiz-mobile', 'Mobilní platforma', 'rMobile')}
            <div className="field wide">
              <label className="opt opt-bare" title={helpFor('Před aplikací vyčistit doporučené skupiny')}>
                <input
                  type="checkbox"
                  checked={(selection['cPresetOptions'] ?? []).length > 0}
                  onChange={() => onToggleOption('cPresetOptions', 'Před aplikací vyčistit doporučené skupiny')}
                />
                <span>Před aplikací presetu vyčistit doporučené skupiny</span>
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="row">
            <div className="field">
              <label htmlFor="wiz-creates">Co vytváří</label>
              <textarea id="wiz-creates" rows={3} value={spec.creates} onChange={(e) => onSpec({ ...spec, creates: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="wiz-audience">Pro koho to vytváří</label>
              <textarea id="wiz-audience" rows={3} value={spec.audience} onChange={(e) => onSpec({ ...spec, audience: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="wiz-tech">Jaké technologie použít</label>
              <textarea id="wiz-tech" rows={3} value={spec.tech} onChange={(e) => onSpec({ ...spec, tech: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="wiz-functions">Jaké funkce implementovat</label>
              <textarea id="wiz-functions" rows={3} value={spec.functions} onChange={(e) => onSpec({ ...spec, functions: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="wiz-files">Jaké soubory vytvořit</label>
              <textarea id="wiz-files" rows={3} value={spec.files} onChange={(e) => onSpec({ ...spec, files: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="wiz-deps">Závislosti nepřidávat bez důvodu</label>
              <textarea
                id="wiz-deps"
                rows={3}
                value={spec.forbiddenDependencies}
                onChange={(e) => onSpec({ ...spec, forbiddenDependencies: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <dl className="summary">
            <dt>Projekt</dt>
            <dd>{projectName || '(neuvedeno)'}</dd>
            <dt>Cíl</dt>
            <dd>{goal || '(neuvedeno)'}</dd>
            <dt>Doména</dt>
            <dd>{radio('rAppDomain') || '(nevybráno)'}</dd>
            <dt>Platforma</dt>
            <dd>{radio('rTarget') || '(nevybráno)'}</dd>
            <dt>Frontend</dt>
            <dd>{radio('rFe') || '(nevybráno)'}</dd>
            <dt>Mobil</dt>
            <dd>{radio('rMobile') || '(nevybráno)'}</dd>
            <dt>Technologie</dt>
            <dd>{spec.tech || '(neuvedeno)'}</dd>
            <dt>Formát výstupu</dt>
            <dd>{formatLabel(format)}</dd>
            <dt>Vybraných voleb</dt>
            <dd>{totalChecked}</dd>
          </dl>
        )}

        <div className="wizard-nav">
          <button type="button" className="btn" disabled={step === 0} onClick={() => onStep(Math.max(0, step - 1))}>
            ‹ Zpět
          </button>
          {isLast ? (
            <button type="button" className="btn btn-primary" onClick={onGenerate}>
              Hotovo, vygenerovat
            </button>
          ) : (
            <button type="button" className="btn btn-primary" disabled={!canNext} onClick={() => onStep(Math.min(WIZARD_STEPS.length - 1, step + 1))}>
              Další ›
            </button>
          )}
          <span className="status">
            Krok {step + 1} z {WIZARD_STEPS.length}
          </span>
        </div>
      </section>

      <section className="panel">
        <h2>Rychlé šablony (presety)</h2>
        <p className="lead">Kliknutím na preset se doplní doporučené volby. Poté je můžete libovolně upravit nebo odznačit.</p>
        {presetCards.map((card) => {
          const mirrorId = PRESET_MIRROR[card.id] ?? card.id
          return (
            <div className="preset-group" key={card.id}>
              <div className="preset-group-label">{card.title}</div>
              <div className="chips">
                {card.options.map((option, index) => {
                  const target = triggerOf[option]?.card ?? mirrorId
                  const active = radio(target) === option
                  return (
                    <button
                      key={option}
                      type="button"
                      className={active ? 'chip on' : 'chip'}
                      title={helpFor(option) || undefined}
                      style={staggerStyle(index)}
                      aria-pressed={active}
                      onClick={() => onChooseTrigger(option, mirrorId)}
                    >
                      {option}
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

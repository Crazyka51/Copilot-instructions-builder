import { useEffect, useState, type CSSProperties } from 'react'
import { LANGUAGES, type Lang } from '../i18n/types'

/** Jak dlouho se přehrává loader po zvolení jazyka, než se předstránka schová. */
const LOADING_MS = 1100

type Phase = 'choose' | 'loading'

/**
 * Předstránka pro výběr jazyka. Ukazuje se při první návštěvě, po zvolení se
 * přehraje krátký loader a teprve pak se načte aplikace.
 */
export function LanguageGate({ onChoose }: { onChoose: (lang: Lang) => void }) {
  const [phase, setPhase] = useState<Phase>('choose')
  const [picked, setPicked] = useState<Lang | null>(null)

  useEffect(() => {
    if (phase !== 'loading' || !picked) return
    const timer = window.setTimeout(() => onChoose(picked), LOADING_MS)
    return () => window.clearTimeout(timer)
  }, [phase, picked, onChoose])

  const choose = (lang: Lang) => {
    if (phase !== 'choose') return
    setPicked(lang)
    setPhase('loading')
  }

  const chosen = LANGUAGES.find((language) => language.code === picked)
  const statusText = phase === 'loading' ? (chosen?.code === 'en' ? 'Loading…' : 'Načítám…') : 'Vyberte jazyk / Choose your language'

  return (
    <div className="gate">
      <div className="gate-glow" aria-hidden="true" />

      <div className="gate-card">
        <header className="gate-brand">
          <h1>
            Copilot <span>Instructions Builder</span>
          </h1>
          <p className="gate-sub">Nástroj pro sestavení konfigurace GitHub Copilotu</p>
          <p className="gate-sub gate-sub-en">Build your GitHub Copilot configuration</p>
        </header>

        <div className={phase === 'loading' ? 'gate-loader loading' : 'gate-loader'}>
          <div className="gate-ring" aria-hidden="true" />
          <div className="gate-ring-inner" aria-hidden="true" />
          <div className="gate-mark" aria-hidden="true">
            <span>AI</span>
          </div>
          <div className="gate-bar" aria-hidden="true">
            <span />
          </div>
        </div>

        <p className="gate-status" role="status" aria-live="polite">
          {statusText}
        </p>

        <div className="gate-langs">
          {LANGUAGES.map((language, index) => {
            const active = language.code === picked
            const classes = ['lang-card']
            if (active) classes.push('on')
            if (picked && !active) classes.push('dim')
            return (
              <button
                key={language.code}
                type="button"
                className={classes.join(' ')}
                style={{ '--stagger': index } as CSSProperties}
                disabled={phase === 'loading'}
                aria-pressed={active}
                onClick={() => choose(language.code)}
              >
                <span className="lang-code">{language.short}</span>
                <span className="lang-text">
                  <strong>{language.nativeName}</strong>
                  <small>{language.tagline}</small>
                </span>
                <span className="lang-check" aria-hidden="true">
                  {active ? '✓' : ''}
                </span>
              </button>
            )
          })}
        </div>

        <p className="gate-note">Jazyk můžete kdykoli změnit v horní liště. / You can change it any time from the top bar.</p>
      </div>
    </div>
  )
}

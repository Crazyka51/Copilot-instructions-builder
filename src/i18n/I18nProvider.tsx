// Poskytovatel překladů pro celou aplikaci.
//
// Překládá se podle českého zdrojového textu, který slouží jako klíč. Co ve slovníku
// chybí, se zobrazí v originále, takže aplikace funguje i s neúplným překladem.
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { en } from './en'
import { enHelp } from './help.en'
import type { Lang } from './types'

type Vars = Record<string, string | number>

export interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Přeloží krátký text (popisek, název karty, název volby). */
  t: (text: string, vars?: Vars) => string
  /** Přeloží text nápovědy podle klíče, s českým textem jako záložní hodnotou. */
  help: (key: string, czech: string) => string
}

const I18nContext = createContext<I18nValue | null>(null)

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    vars[name] === undefined ? match : String(vars[name])
  )
}

export function I18nProvider({
  lang,
  setLang,
  children
}: {
  lang: Lang
  setLang: (lang: Lang) => void
  children: ReactNode
}) {
  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (text, vars) => interpolate(lang === 'cs' ? text : en[text] ?? text, vars),
      help: (key, czech) => (lang === 'cs' ? czech : enHelp[key] ?? czech)
    }),
    [lang, setLang]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n musí být použito uvnitř I18nProvider.')
  return value
}

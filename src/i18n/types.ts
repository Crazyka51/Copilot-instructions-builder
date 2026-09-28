// Podporované jazyky rozhraní.

export type Lang = 'cs' | 'en'

export const DEFAULT_LANG: Lang | null = null

export interface LanguageOption {
  code: Lang
  /** Název jazyka tak, jak se píše v tom kterém jazyce. */
  nativeName: string
  /** Popisek na předstránce, psaný v daném jazyce. */
  tagline: string
  /** Krátký kód pro přepínač v horní liště. */
  short: string
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: 'cs',
    nativeName: 'Čeština',
    tagline: 'Rozhraní, nápověda i obsah v češtině.',
    short: 'CS'
  },
  {
    code: 'en',
    nativeName: 'English',
    tagline: 'Interface, help and content in English.',
    short: 'EN'
  }
]

export function isLang(value: unknown): value is Lang {
  return value === 'cs' || value === 'en'
}

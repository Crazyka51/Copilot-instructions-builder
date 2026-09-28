import { Builder } from './components/Builder'
import { LanguageGate } from './components/LanguageGate'
import { I18nProvider } from './i18n'
import { isLang, type Lang } from './i18n/types'
import { usePersistentState } from './lib/usePersistentState'

/**
 * Kořen aplikace. Dokud není zvolený jazyk, ukazuje se předstránka s loaderem.
 * Volba se ukládá do localStorage, takže při další návštěvě jde rovnou do aplikace.
 */
export default function App() {
  const [storedLang, setLang] = usePersistentState<Lang | null>('lang', null)
  const lang = isLang(storedLang) ? storedLang : null

  if (!lang) return <LanguageGate onChoose={setLang} />

  return (
    <I18nProvider lang={lang} setLang={setLang}>
      <Builder />
    </I18nProvider>
  )
}

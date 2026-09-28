// Spojení všech anglických slovníků do jednoho.
//
// Pořadí spreadů rozhoduje u klíčů, které se objeví na více místech. Hodnoty
// u stejných klíčů musí být vždy stejné, hlídá to test v src/lib/i18n.test.ts.
import { enContent } from './en.content'
import { enSkills } from './en.skills'
import { enUi } from './en.ui'

export const en: Record<string, string> = {
  ...enContent,
  ...enSkills,
  ...enUi
}

export { enContent, enSkills, enUi }

import { useMemo, useState } from 'react'
import { CardGrid } from './CardGrid'
import { DictionaryTab } from './DictionaryTab'
import { FooterBar } from './FooterBar'
import { OutputModal } from './OutputModal'
import { PresetsTab } from './PresetsTab'
import { ProjectTab } from './ProjectTab'
import { Sidebar } from './Sidebar'
import { SkillsTab } from './SkillsTab'
import { TabHeader } from './TabHeader'
import { TopBar } from './TopBar'
import { useI18n } from '../i18n'
import { download } from '../lib/download'
import { generate } from '../lib/generate'
import {
  applyPresetWithTrigger,
  cardById,
  cards,
  countCheckedInTab,
  emptySelection,
  fromConfig,
  optionsFromSelection,
  sanitizeSelection,
  skills,
  toConfig,
  toggleOption,
  type Config
} from '../lib/state'
import { SPECIAL_TABS, filesForFormat, tabs, zipFileName } from '../lib/ui'
import { defaultSpec, type GeneratedFile, type Selection, type Spec } from '../lib/types'
import { clearPersistedState, usePersistentState } from '../lib/usePersistentState'

const TAB_LABELS = tabs.map((tab) => tab.label)
const TOTAL_OPTIONS =
  cards.filter((card) => !card.dynamic && card.tab !== 'Presety').reduce((sum, card) => sum + card.options.length, 0) +
  skills.length

/** Vlastní aplikace bez předstránky. Předpokládá, že jazyk je už zvolený. */
export function Builder() {
  const { t } = useI18n()
  const [tab, setTab] = usePersistentState<string>('tab', 'Presety')
  const [selection, setSelection] = usePersistentState<Selection>('selection', emptySelection())
  const [projectName, setProjectName] = usePersistentState<string>('project', 'EnterpriseProject')
  const [goal, setGoal] = usePersistentState<string>('goal', '')
  const [spec, setSpec] = usePersistentState<Spec>('spec', defaultSpec())
  const [query, setQuery] = useState('')
  const [hint, setHint] = useState('')
  const [wizardStep, setWizardStep] = useState(0)
  const [output, setOutput] = useState<GeneratedFile[] | null>(null)
  const [activeFile, setActiveFile] = useState(0)

  const activeTab = TAB_LABELS.includes(tab) ? tab : 'Presety'
  const options = useMemo(() => optionsFromSelection(selection), [selection])
  const totalChecked = useMemo(() => Object.values(selection).reduce((sum, values) => sum + values.length, 0), [selection])
  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    for (const entry of tabs) result[entry.label] = countCheckedInTab(selection, entry.label)
    result['Skills'] = (result['Skills'] ?? 0) + (selection['skillGroups']?.length ?? 0)
    return result
  }, [selection])

  const openTab = (label: string) => {
    setTab(label)
    setQuery('')
  }

  // ---------- výběr voleb ----------

  const selectOption = (cardId: string, option: string) => {
    setSelection((current) => toggleOption(current, cardId, option))
    setHint('')
  }

  const selectAllInCard = (cardId: string) => {
    const card = cardById.get(cardId)
    if (!card || card.kind === 'radio') return
    setSelection((current) => ({ ...current, [cardId]: [...card.options] }))
    setHint('')
  }

  const clearCard = (cardId: string) => {
    setSelection((current) => ({ ...current, [cardId]: [] }))
  }

  const clearTab = () => {
    const next: Selection = { ...selection }
    let cleared = 0
    for (const card of cards) {
      if (card.tab !== activeTab) continue
      cleared += (next[card.id] ?? []).length
      next[card.id] = []
    }
    if (activeTab === 'Skills') {
      cleared += (next['skillGroups'] ?? []).length
      next['skillGroups'] = []
    }
    setSelection(next)
    setHint(t('Záložka „{tab}“ vyčištěna: odznačeno {count} voleb.', { tab: t(activeTab), count: cleared }))
  }

  const toggleSkill = (title: string) => {
    setSelection((current) => {
      const checked = current['skillGroups'] ?? []
      const next = checked.includes(title) ? checked.filter((item) => item !== title) : [...checked, title]
      return { ...current, skillGroups: next }
    })
  }

  const setSkills = (titles: string[]) => {
    setSelection((current) => ({ ...current, skillGroups: titles }))
  }

  /**
   * Vybere hodnotu v radio kartě (doména, framework, platforma, cíl) a aplikuje
   * odpovídající preset. Samotné presety tyto karty neobsahují, takže je musíme
   * nastavit zvlášť, jinak by průvodce volbu nikdy nezapsal.
   */
  const chooseTrigger = (label: string, fallbackCardId: string) => {
    const { selection: next, added } = applyPresetWithTrigger(selection, label, fallbackCardId, options.clearBeforePreset)
    setSelection(next)
    setHint(
      added > 0
        ? t('Preset „{label}“ aplikován: doplněno {added} doporučených voleb. Můžete je odznačit.', {
            label: t(label),
            added
          })
        : t('Preset „{label}“ nemá doporučené volby, vyplňte volby ručně.', { label: t(label) })
    )
  }

  // ---------- konfigurace a výstup ----------

  const doGenerate = () => {
    setOutput(generate({ name: projectName, goal, selection, spec }, options))
    setActiveFile(0)
  }

  const saveConfig = () => {
    const config = toConfig(projectName, goal, spec as unknown as Record<string, string>, options, selection)
    download('builder-config.json', JSON.stringify(config, null, 2), 'application/json')
    setHint(t('Konfigurace uložena do builder-config.json.'))
  }

  const loadConfig = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const config = JSON.parse(String(reader.result)) as Config
        const restored = sanitizeSelection(fromConfig(config))
        setSelection(restored)
        if (config.project) setProjectName(config.project)
        if (config.goal) setGoal(config.goal)
        if (config.spec) setSpec({ ...defaultSpec(), ...config.spec })
        const count = Object.values(restored).reduce((sum, values) => sum + values.length, 0)
        setHint(t('Konfigurace načtena: obnoveno {count} voleb.', { count }))
      } catch (error) {
        setHint(t('Načtení selhalo: {message}', { message: (error as Error).message }))
      }
    }
    reader.onerror = () => setHint(t('Soubor se nepodařilo přečíst.'))
    reader.readAsText(file, 'utf-8')
  }

  const resetAll = () => {
    clearPersistedState()
    setSelection(emptySelection())
    setProjectName('EnterpriseProject')
    setGoal('')
    setSpec(defaultSpec())
    setWizardStep(0)
    setQuery('')
    setOutput(null)
    setHint(t('Stav byl obnoven do výchozího nastavení.'))
  }

  const skillCount = (selection['skillGroups'] ?? []).length
  const generatedFiles = useMemo(() => filesForFormat(options.format, options, skillCount), [options, skillCount])
  const fileCount = generatedFiles.length
  const showSearch = activeTab !== 'Presety' && activeTab !== 'Slovník'
  const canClearTab = showSearch && (counts[activeTab] ?? 0) > 0

  return (
    <div className="app">
      <TopBar
        projectName={projectName}
        totalChecked={totalChecked}
        format={options.format}
        onSave={saveConfig}
        onLoad={loadConfig}
        onReset={resetAll}
        onGenerate={doGenerate}
      />

      <div className="body">
        <Sidebar
          tabs={tabs}
          active={activeTab}
          counts={counts}
          totalChecked={totalChecked}
          totalOptions={TOTAL_OPTIONS}
          onSelect={openTab}
        />

        <main className="content">
          <TabHeader
            title={activeTab}
            count={counts[activeTab] ?? 0}
            query={query}
            showSearch={showSearch}
            onQuery={setQuery}
            onClearTab={canClearTab ? clearTab : undefined}
          />

          {/* Klíč podle hlášky znovu spustí animaci u každé nové zprávy. */}
          {hint && (
            <div className="notes info" key={hint}>
              {hint}
            </div>
          )}

          {activeTab === 'Presety' && (
            <PresetsTab
              step={wizardStep}
              onStep={setWizardStep}
              selection={selection}
              onChooseTrigger={chooseTrigger}
              onToggleOption={selectOption}
              projectName={projectName}
              onProjectName={setProjectName}
              goal={goal}
              onGoal={setGoal}
              spec={spec}
              onSpec={setSpec}
              totalChecked={totalChecked}
              format={options.format}
              onGenerate={doGenerate}
            />
          )}

          {activeTab === 'Skills' && (
            <SkillsTab
              selection={selection}
              query={query}
              onSelect={selectOption}
              onSelectAll={selectAllInCard}
              onClearCard={clearCard}
              onToggleSkill={toggleSkill}
              onSetSkills={setSkills}
            />
          )}

          {activeTab === 'Projekt' && (
            <ProjectTab
              selection={selection}
              query={query}
              format={options.format}
              files={generatedFiles}
              onSelect={selectOption}
              onSelectAll={selectAllInCard}
              onClearCard={clearCard}
            />
          )}

          {activeTab === 'Slovník' && <DictionaryTab />}

          {!SPECIAL_TABS.includes(activeTab) && (
            <CardGrid
              key={activeTab}
              tab={activeTab}
              selection={selection}
              query={query}
              onSelect={selectOption}
              onSelectAll={selectAllInCard}
              onClearCard={clearCard}
            />
          )}
        </main>
      </div>

      <FooterBar
        totalChecked={totalChecked}
        fileCount={fileCount}
        format={options.format}
        canClearTab={canClearTab}
        onClearTab={clearTab}
        onGenerate={doGenerate}
      />

      {output && (
        <OutputModal
          files={output}
          active={activeFile}
          zipName={zipFileName(projectName)}
          onActive={setActiveFile}
          onClose={() => setOutput(null)}
        />
      )}
    </div>
  )
}

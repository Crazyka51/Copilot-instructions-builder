import { useMemo, useState } from 'react'
import { CardGrid } from './components/CardGrid'
import { DictionaryTab } from './components/DictionaryTab'
import { FooterBar } from './components/FooterBar'
import { OutputModal } from './components/OutputModal'
import { PresetsTab } from './components/PresetsTab'
import { ProjectTab } from './components/ProjectTab'
import { Sidebar } from './components/Sidebar'
import { SkillsTab } from './components/SkillsTab'
import { TabHeader } from './components/TabHeader'
import { TopBar } from './components/TopBar'
import { download } from './lib/download'
import { generate } from './lib/generate'
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
} from './lib/state'
import { SPECIAL_TABS, filesForFormat, tabs } from './lib/ui'
import { defaultSpec, type GeneratedFile, type Selection, type Spec } from './lib/types'
import { clearPersistedState, usePersistentState } from './lib/usePersistentState'

const TAB_LABELS = tabs.map((tab) => tab.label)
const TOTAL_OPTIONS =
  cards.filter((card) => !card.dynamic && card.tab !== 'Presety').reduce((sum, card) => sum + card.options.length, 0) +
  skills.length

export default function App() {
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
    setHint(`Záložka „${activeTab}“ vyčištěna: odznačeno ${cleared} voleb.`)
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
        ? `Preset „${label}“ aplikován: doplněno ${added} doporučených voleb. Můžete je odznačit.`
        : `Preset „${label}“ nemá doporučené volby, vyplňte volby ručně.`
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
    setHint('Konfigurace uložena do builder-config.json.')
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
        setHint(`Konfigurace načtena: obnoveno ${count} voleb.`)
      } catch (error) {
        setHint(`Načtení selhalo: ${(error as Error).message}`)
      }
    }
    reader.onerror = () => setHint('Soubor se nepodařilo přečíst.')
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
    setHint('Stav byl obnoven do výchozího nastavení.')
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
        onProjectName={setProjectName}
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

          {/* Klíč podle záložky a textu znovu spustí animaci při přepnutí a u nové zprávy. */}
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

      {output && <OutputModal files={output} active={activeFile} onActive={setActiveFile} onClose={() => setOutput(null)} />}
    </div>
  )
}

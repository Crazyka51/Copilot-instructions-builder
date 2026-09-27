import { formatLabel } from '../lib/ui'
import type { OutputFormat } from '../lib/types'

/** Horní lišta: název projektu, stav a hlavní akce. */
export function TopBar({
  projectName,
  onProjectName,
  totalChecked,
  format,
  onSave,
  onLoad,
  onReset,
  onGenerate
}: {
  projectName: string
  onProjectName: (value: string) => void
  totalChecked: number
  format: OutputFormat
  onSave: () => void
  onLoad: (file: File) => void
  onReset: () => void
  onGenerate: () => void
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <h1>
          Copilot <span>Workspace Architect</span>
        </h1>
        <span className="version">v1.1</span>
      </div>

      <div className="field topbar-field">
        <label htmlFor="project-name">Název projektu</label>
        <input
          id="project-name"
          type="text"
          value={projectName}
          onChange={(e) => onProjectName(e.target.value)}
          placeholder="EnterpriseProject"
        />
      </div>

      <div className="grow" />

      <span className="topbar-status">
        <strong>{totalChecked}</strong> voleb · <code>{formatLabel(format)}</code>
      </span>

      <div className="topbar-actions">
        <button type="button" className="btn" onClick={onSave} title="Uloží volby do souboru builder-config.json">
          Uložit konfiguraci
        </button>
        <label className="btn btn-file" title="Načte volby ze souboru builder-config.json">
          Načíst konfiguraci
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onLoad(file)
              e.target.value = ''
            }}
          />
        </label>
        <button type="button" className="btn" onClick={onReset} title="Smaže všechny volby a vrátí výchozí stav">
          Reset
        </button>
        <button type="button" className="btn btn-primary" onClick={onGenerate}>
          Vygenerovat soubory
        </button>
      </div>
    </header>
  )
}

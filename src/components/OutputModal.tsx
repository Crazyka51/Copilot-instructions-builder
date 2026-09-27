import { useEffect, useRef, useState } from 'react'
import { download, downloadMany } from '../lib/download'
import type { GeneratedFile } from '../lib/types'

/** Modální okno s náhledem a uložením vygenerovaných souborů. */
export function OutputModal({
  files,
  active,
  onActive,
  onClose
}: {
  files: GeneratedFile[]
  active: number
  onActive: (index: number) => void
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const file = files[Math.min(active, files.length - 1)]

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    setCopied(false)
  }, [active])

  const lines = file ? file.content.split('\n').length : 0

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Vygenerované soubory (${files.length})`}
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <h2>Vygenerované soubory ({files.length})</h2>
          <div className="grow" />
          <button ref={closeRef} type="button" className="btn btn-sm" onClick={onClose}>
            Zavřít
          </button>
        </header>

        <div className="tabs" role="tablist" aria-label="Vygenerované soubory">
          {files.map((entry, index) => (
            <button
              key={entry.path}
              type="button"
              role="tab"
              aria-selected={index === active}
              className={index === active ? 'on' : ''}
              title={entry.path}
              onClick={() => onActive(index)}
            >
              {entry.path.split('/').pop()}
            </button>
          ))}
        </div>

        <pre className="pre">{file?.content}</pre>

        <footer>
          <span className="meta">
            {file?.path} · {lines} řádků · {(file?.content.length ?? 0).toLocaleString('cs')} znaků
          </span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              void navigator.clipboard?.writeText(file?.content ?? '')
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1500)
            }}
          >
            {copied ? 'Zkopírováno' : 'Kopírovat'}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => file && download(file.path.split('/').pop() ?? 'soubor.txt', file.content, 'text/plain')}
          >
            Uložit tento
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => downloadMany(files)}>
            Uložit všechny
          </button>
        </footer>
      </div>
    </div>
  )
}

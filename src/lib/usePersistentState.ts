import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

export const STORAGE_PREFIX = 'cbw.v1.'

/**
 * Stav, který se ukládá do localStorage, takže obnovení stránky neztratí volby.
 * Slouží jako rozšíření useState, API je stejné.
 */
export function usePersistentState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = `${STORAGE_PREFIX}${key}`
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw !== null) return JSON.parse(raw) as T
    } catch {
      /* poškozený záznam ignorujeme a použijeme výchozí hodnotu */
    }
    return initial
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value))
    } catch {
      /* například v privátním režimu nemusí být úložiště dostupné */
    }
  }, [storageKey, value])

  return [value, setValue]
}

/** Smaže všechny uložené klíče builderu. */
export function clearPersistedState(): void {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(STORAGE_PREFIX)) window.localStorage.removeItem(key)
    }
  } catch {
    /* ignorujeme */
  }
}

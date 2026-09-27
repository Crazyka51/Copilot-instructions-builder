
    Function Get-AgentsMd {
        $usePnpm = ($vals.Arch -match "pnpm|Turborepo|Nx")
        if ($usePnpm) {
            $ci = "pnpm install"; $cd = "pnpm dev"; $cb = "pnpm build"
            $ct = "pnpm test"; $cl = "pnpm lint"; $cy = "pnpm typecheck"
        } else {
            $ci = "npm install"; $cd = "npm run dev"; $cb = "npm run build"
            $ct = "npm test"; $cl = "npm run lint"; $cy = "npm run typecheck"
        }
        $py = @"
# AGENTS.md — $projName

Univerzální instrukce pro AI coding agenty (Copilot, Codex, Cursor, Claude Code, Gemini CLI, Aider).
Soubor leží v kořeni repozitáře; agent použije nejbližší ``AGENTS.md`` v adresářovém stromu.

## Přehled projektu
* **Architektura:** $($vals.Arch) — $($vals.ArchType)
* **Cílové platformy:** $($vals.Target)
* **Frontend:** $(StackPair $vals.Fe $vals.Css)
* **Backend:** $($vals.Be)
* **Databáze:** $($vals.DbStrategy)
* **Doména:** $($vals.AppDomain)
* **Nasazení:** $($vals.Deploy)

## Příkazy
- Instalace závislostí: ``$ci``
- Vývojový server: ``$cd``
- Produkční build: ``$cb``
- Testy: ``$ct``
- Lint a formát: ``$cl``
- Typová kontrola: ``$cy``

> Ověř názvy skriptů ve ``package.json`` a tento seznam uprav podle skutečnosti.

## Konvence kódu
- Striktní typy, žádné ``any``.
- Validuj vstup na serveru, nikdy nedůvěřuj klientu.
- Texty nepatří do komponent, ale do i18n slovníků.
- Nikdy necommituj tajemství ani soubory ``.env``.
- Nové chování vždy doplň testem.

## Kde jsou instrukce
* ``.github/copilot-instructions.md`` — plný kontext projektu (vždy aktivní pro Copilot)
$(if ($modeExtended) { "* ``.github/skills/SKILL.md`` — postupy a kontrolní seznamy (načítané podle potřeby)`n" })* ``AGENTS.md`` — tento soubor, společný pro všechny agenty
"@
        return $py
    }
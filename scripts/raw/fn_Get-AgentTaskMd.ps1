
    Function Get-AgentTaskMd {
        $py = @"
---
name: agent-task-$($projName.ToLower() -replace '[^a-z0-9]+','-')
description: Provádí zadané úlohy v projektu $projName podle pravidel v .github/copilot-instructions.md.
---

# Agent Task: $projName

## Účel
Samostatný agent pro plnění zadaných úloh v tomto repozitáři. Pracuje podle
``.github/copilot-instructions.md`` a případně ``.github/skills/SKILL.md``.

## Kontext projektu
* **Doména:** $($vals.AppDomain)
* **Architektura:** $($vals.Arch) — $($vals.ArchType)
* **Frontend:** $(StackPair $vals.Fe $vals.Css)
* **Backend:** $($vals.Be)
* **Databáze:** $($vals.DbStrategy)

## Pravidla
1. Nejdřív si přečti instrukce a relevantní skilly, teprve pak měň kód.
2. Drž se zvoleného tech stacku, nepřidávej závislosti bez schválení.
3. Nikdy necommituj tajemství ani soubory ``.env``.
4. Validuj vstup na serveru, ošetři chyby a zaloguj je.
5. Změny dělej malé a srozumitelné, s testy.

## Postup
1. Přečti zadání a instrukce.
2. Prozkoumej relevantní část kódu.
3. Naplánuj nejmenší funkční změnu.
4. Implementuj a přidej testy.
5. Spusť lint, typovou kontrolu a testy.
6. Vytvoř pull request s popisem změny a dopadů.

## Kritéria hotovo
- [ ] Zadání je splněno a popsáno v pull requestu.
- [ ] Testy procházejí a pokrývají nové chování.
- [ ] Lint a typová kontrola bez chyb.
- [ ] Žádné nové nedeklarované závislosti ani tajemství.
"@
        return $py
    }
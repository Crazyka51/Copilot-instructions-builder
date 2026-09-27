## Agent Task

### Cíl
Doplňovat a udržovat projekt podle specifikace výše: **$($vals.AppDomain)** postavená nad $(StackPair $vals.Fe $vals.Be) a $($vals.DbStrategy).

### Rozsah práce
- Dodržuj architekturu, tech stack a databázová pravidla z tohoto souboru, případně z ``.github/skills/SKILL.md``.
- Neměň strukturu repozitáře ani závislosti, pokud to zadání explicitně nevyžaduje.
- Malé, soustředěné změny s testy a popisem v pull requestu.

### Kroky
1. Načti tento soubor a relevantní skilly.
2. Ověř, že rozumíš zadání; při nejasnosti se zeptej, nedomýšlej si.
3. Implementuj nejmenší funkční změnu.
4. Přidej nebo uprav testy.
5. Spusť lint, typovou kontrolu a testy.
6. Shrň změnu a její dopady.

### Kritéria hotovo
- [ ] Kód je typově bezpečný a prochází lintem.
- [ ] Testy pokrývají nové nebo změněné chování.
- [ ] Nejsou přidány nedeklarované závislosti ani tajemství.
- [ ] Změna je popsána v pull requestu včetně dopadů.
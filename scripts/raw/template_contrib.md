# Přispívání do projektu $projName

## Postup
1. Vytvoř větev s popisným názvem (například ``feat/kosik-slevy``).
2. Proveď změnu včetně testů.
3. Spusť lint, typovou kontrolu a testy.
4. Otevři pull request a vyplň popis změny i dopadů.
5. Po schválení a zeleném CI proveď merge.

## Požadavky na pull request
- Malý a soustředěný na jednu věc.
- Zelené CI.
- Popis: co se změnilo, proč a jaké to má dopady.
- U změny databáze i postup migrace a návratu.

## Konvence commitů
Používej konvenční formát: ``typ(oblast): popis`` (například ``fix(api): validace e-mailu``).
Typy: ``feat``, ``fix``, ``docs``, ``refactor``, ``test``, ``chore``.

## Co nikdy nedělat
- Necommituj tajemství, klíče ani soubory ``.env``.
- Nepřidávej závislosti bez dohody.
- Nevypínej testy ani kontroly, abys prošel.
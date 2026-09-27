
    Function Get-WorkflowExamples {
        $hasValidation = ($vals.Forms -match "Zod")
        $stateMgmt = $vals.State
        $apiStyle = $vals.ApiDesign
        $example = @"
## Workflow pro typové úlohy

Konkrétní postup pro činnosti, které budeš dělat opakovaně.

### Nový formulář
1. Vytvoř schéma: ``schemas/<nazev>.ts``.
$(if ($hasValidation) { "2. Použij ho na klientu i serveru - jedno schéma, jedna pravda." } else { "2. Validuj vstup na serveru, klientská validace je jen pro pohodlí uživatele." })
3. Komponentu umísti do ``components/forms/<NazevForm.tsx>``.
4. Přidej test: platná data projdou, neplatná vrátí chybu u konkrétního pole.
5. Ošetři stav odesílání, aby se formulář neodeslal dvakrát.

### Nový API endpoint
1. Zvol metodu podle významu (GET čte, POST vytváří, PATCH mění, DELETE maže).
2. Validuj vstup na hranici API a vracej stav 400 s popisem konkrétního pole.
3. Ověř oprávnění **na serveru**, nikdy podle údaje z klienta.
4. Chybu zaloguj s korelačním ID a vrať srozumitelnou odpověď bez interních detailů.
5. Napiš test včetně chybových stavů.

### Nová komponenta
1. Rozhodni, zda jde o prezentační komponentu, nebo obal s logikou.
2. Drž ji malou - jedna odpovědnost.
3. Texty nepiš přímo do komponenty.
4. Zkontroluj ovládání klávesnicí a kontrast.
5. Pokud jde o obecně použitelnou komponentu, přidej ji do ``components/ui``.

### Nalezená bezpečnostní chyba
1. **Nezveřejňuj** detail zranitelnosti v commitu ani v popisu pull requestu.
2. Oprav ji v samostatné větvi a v samostatném pull requestu.
3. Přidej regresní test, který selže před opravou a projde po ní.
4. Ověř, zda stejná chyba není i jinde.
5. Uveď dopad a doporučený postup v soukromém kanálu, ne ve veřejném issue.

### Změna databázového schématu
1. Napiš migraci - nikdy needituj databázi ručně.
2. Drž migraci zpětně kompatibilní (přidej sloupec, počkej, teprve pak odeber).
3. Otestuj na kopii produkčních dat.
4. Připrav postup návratu.
"@
        return $example
    }
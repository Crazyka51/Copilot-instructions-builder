
    Function Get-ReviewChecklist {
        $items = @(
            "Kód řeší zadání a nic víc."
            "Nejsou přidány nedeklarované závislosti."
            "Veškerý vstup je validován na serveru."
            "Oprávnění se ověřuje na serveru, ne podle údaje z klienta."
            "V kódu ani v konfiguraci nejsou tajemství."
            "Chyby se logují a nevracejí se interní detaily."
            "Texty nejsou napevno v komponentách."
            "Nové chování pokrývá test."
            "Testy procházejí a lint i typová kontrola jsou zelené."
            "Nejsou provedeny nesouvisející změny."
            "Zmíněny dopady a případná migrace."
            "Struktura souborů odpovídá konvenci projektu."
        )
        if ($lists.Legal -notmatch "Není vyžadováno") { $items += "Zmíněny dopady na osobní údaje a jejich retenci." }
        if ($lists.Integrations -notmatch "Není vyžadováno") { $items += "Webhooky a externí volání jsou idempotentní." }
        $md = @("## Kontrolní seznam pro code review", "", "Projdi tyto body u každé změny před mergem.", "")
        foreach ($i in $items) { $md += "- [ ] $i" }
        return ($md -join "`n")
    }
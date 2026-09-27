
    Function Get-TaskPrompt {
        $role = Get-RoleName $vals.AppDomain
        $hasMobile = $mobileChosen
        $sections = @()
        $sections += Get-TaskSection "Doménové funkce" @($lists.Ecommerce, $lists.Booking, $lists.Saas, $lists.Lms, $lists.Crm)
        $sections += Get-TaskSection "Aplikace, správa a obsah" @($lists.Admin, $lists.Core, $lists.Ai)
        $sections += Get-TaskSection "Externí integrace" @($lists.Integrations)
        $sections += Get-TaskSection "Marketing a růst" @($lists.Marketing)
        $sections += Get-TaskSection "Právo, soukromí a soulad" @($lists.Legal, $lists.Compliance)
        $sections += Get-TaskSection "Kvalita, testování a provoz" @($lists.Test, $lists.CiCd, $lists.Observability, $lists.Log, $lists.VercelFeatures)
        $sections += Get-TaskSection "Autentizace, role a zabezpečení" @($lists.Auth, $lists.Sec)
        $sections += Get-TaskSection "Frontend a UX" @($lists.FeUi)
        if ($hasMobile) { $sections += Get-TaskSection "Mobilní aplikace" @($lists.MobileFeatures) }
        $sections += Get-TaskSection "Chování při práci s kódem" @($lists.BuildValidation, $lists.ProjectLayout, $lists.CodeStyleBehavior, $lists.TestingBehavior, $lists.DocsBehavior, $lists.SecurityBehavior, $lists.Accessibility, $lists.Performance)
        $taskBody = (@($sections | Where-Object { $_ -ne "" }) -join "`n`n")

        $stackLines = @(
            "* **Doména:** $($vals.AppDomain)"
            "* **Architektura:** $($vals.Arch) — $($vals.ArchType)"
            "* **Rendering:** $($vals.Render)"
            "* **Frontend:** $(StackPair $vals.Fe $vals.Css)"
            "* **Backend:** $($vals.Be)"
            "* **Databáze:** $($vals.DbStrategy) + $($vals.Orm)"
            "* **Autentizace:** $($vals.AuthType)"
            "* **Nasazení:** $($vals.Deploy)"
        )
        if ($hasMobile) { $stackLines += "* **Mobil:** $($vals.Mobile) ($($vals.MobileNav), $($vals.MobileState))" }

        $py = @"
# Úkolový prompt: $projName

Od teď v tomto repozitáři vystupuješ jako **$role**. Neodpovídej obecně - dodávej
konkrétní, otestovaný a nasaditelný kód, který respektuje níže uvedený kontext.

## Tvoje role
* Navrhuj a implementuj funkce od databáze po UI.
* Drž se zvoleného tech stacku a architektury, nevnucuj alternativy.
* Piš kód tak, aby mu rozuměl i někdo, kdo projekt vidí poprvé.
* U každé změny vysvětli dopad a rizika.

## Kontext projektu
$($stackLines -join "`n")

## Hlavní úkoly

$taskBody

### Průběžné úkoly (platí vždy)
- Udržuj build, typovou kontrolu a lint zelené.
- Ke každé nové nebo změněné funkci přidej test.
- Neměň strukturu repozitáře ani závislosti bez výslovného zadání.
- Nikdy necommituj tajemství, klíče ani soubory ``.env``.
- Validuj a sanitizuj veškerý vstup na serveru.
- Zapisuj chyby do logu, nepolykej je.

## Jak postupovat
1. Přečti ``.github/copilot-instructions.md`` a případně ``.github/skills/SKILL.md``.
2. Prozkoumej relevantní část kódu, než cokoli změníš.
3. Navrhni nejmenší funkční změnu a krátce ji popiš.
4. Implementuj ji včetně testů.
5. Spusť lint, typovou kontrolu a testy.
6. Shrň, co se změnilo, proč a jaké to má dopady.

## Když si nejsi jistý
- Zeptej se místo domýšlení. Uveď, co přesně potřebuješ vyjasnit.
- Když najdeš v zadání rozpor, upozorni na něj a navrhni řešení.

## Co nikdy nedělat
- Nepřidávej závislosti, které nejsou v manifestu.
- Neobcházej ověřování oprávnění na serveru.
- Nevypínej testy ani kontroly, abys "prošel".
- Nepřepisuj cizí funkční kód bez důvodu.

## Kritéria hotovo
- [ ] Zadání je splněno a popsáno.
- [ ] Testy procházejí a pokrývají nové chování.
- [ ] Lint a typová kontrola bez chyb.
- [ ] Žádné nové nedeklarované závislosti ani tajemství.
- [ ] Dopady a případná migrace jsou popsané.
"@
        return $py
    }
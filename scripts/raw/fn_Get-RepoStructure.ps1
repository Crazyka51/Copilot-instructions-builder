
    Function Get-RepoStructure {
        $isMonorepo = ($vals.Arch -match "monorepo|workspaces|Turborepo|Nx")
        $isNext = ($vals.Fe -match "Next\.js")
        $isNuxt = ($vals.Fe -match "Nuxt")
        $isVue = ($vals.Fe -match "Vue|Nuxt")
        if ($isMonorepo) {
            $tree = @"
``````
.
├── apps/
│   ├── web/                     # veřejná aplikace
│   ├── admin/                   # administrace
│   └── mobile/                  # mobilní aplikace (pokud je zvolena)
├── packages/
│   ├── shared-types/            # typy sdílené mezi aplikacemi
│   ├── ui/                      # sdílené UI komponenty
│   └── config/                  # sdílená konfigurace (eslint, tsconfig)
├── .github/
│   ├── copilot-instructions.md
│   ├── workflows/
│   └── skills/
└── package.json
``````
"@
        } elseif ($isNext) {
            $tree = @"
``````
src/
├── app/                         # App Router
│   ├── layout.tsx               # root layout
│   ├── page.tsx                 # homepage
│   ├── (auth)/                  # skupina chráněných rout
│   ├── api/                     # route handlers
│   └── globals.css
├── components/
│   ├── ui/                      # základní komponenty (Shadcn)
│   ├── forms/                   # formuláře
│   └── layout/                  # hlavička, patička, navigace
├── lib/                         # pomocné funkce (db, auth, utils)
├── schemas/                     # validační schémata (Zod)
├── actions/                     # Server Actions
├── types/                       # sdílené typy
└── __tests__/                   # testy vedle kódu nebo zde
``````
"@
        } elseif ($isVue -or $isNuxt) {
            $tree = @"
``````
src/
├── pages/                       # souborové routování
├── components/
│   ├── ui/                      # základní komponenty
│   └── forms/                   # formuláře
├── composables/                 # znovupoužitelná logika
├── stores/                      # stav aplikace
├── schemas/                     # validační schémata
├── types/                       # sdílené typy
└── __tests__/
``````
"@
        } else {
            $tree = @"
``````
src/
├── components/
│   ├── ui/                      # základní komponenty
│   ├── forms/                   # formuláře
│   └── layout/                  # rozložení stránky
├── lib/                         # pomocné funkce
├── schemas/                     # validační schémata
├── services/                    # přístup k datům a API
├── types/                       # sdílené typy
└── __tests__/
``````
"@
        }
        return @"
## Struktura repozitáře

Uspořádej kód takto. Nové soubory umísťuj na místo, které odpovídá jejich odpovědnosti.

$tree

**Pravidla pro umístění:**
- Komponenta, která se používá na více místech, patří do ``components/ui`` nebo ``components``.
- Přímý přístup k databázi nikdy nepatří do komponenty - použij vrstvu služeb nebo akci.
- Validační schéma patří do ``schemas`` a používá se na klientu i serveru.
"@
    }
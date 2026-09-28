<p align="center">
  <img src="docs/banner.svg" width="900" alt="Copilot Instructions Builder">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.7">
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6">
  <img src="https://img.shields.io/badge/testy-43%20proch%C3%A1z%C3%AD-00c88a?style=flat-square" alt="Testy">
  <img src="https://img.shields.io/badge/pnpm-vy%C5%BEadov%C3%A1n-F69220?style=flat-square&logo=pnpm&logoColor=white" alt="pnpm">
  <img src="https://img.shields.io/badge/licence-MIT-00c88a?style=flat-square" alt="Licence MIT">
</p>

<p align="center">
  Naklikáte doménu, technologie a moduly. Dostanete hotovou konfiguraci pro GitHub Copilot.
</p>

---

## O čem to vlastně je

Copilot Instructions Builder je webový průvodce, který z vašich voleb sestaví sadu souborů pro GitHub Copilot. Provede vás projektem od domény (e-shop, SaaS, LMS) přes technologický stack až po jednotlivé moduly. Copilot pak z těch souborů čte kontext, takže píše kód podle vašich konvencí místo toho, aby si vymýšlel vlastní.

Všechno se počítá v prohlížeči. Nepotřebujete backend, přihlášení ani instalaci, a vygenerované soubory si jen zkopírujete do svého repozitáře.

> [!TIP]
> Chcete vygenerovat konfiguraci hned? Otevřete aplikaci, projděte pět kroků průvodce a klikněte na **Vygenerovat soubory**. Všechno běží v prohlížeči, nikam se nic neposílá.

## Proč to existuje

Ruční psaní instrukcí pro Copilot je otrava. Člověk obvykle skončí u tří odstavců, zapomene na konvence projektu a po měsíci neví, proč tam ta pravidla jsou. Tenhle nástroj z toho udělá něco, co se dá naklikat a co jde rozumně udržovat:

- **Konzistentní kontext.** Stejná struktura instrukcí pro každý projekt, ať ho začínáte znovu nebo přebíráte.
- **Doménové know-how.** Presety pro e-shop, rezervační systém, SaaS, LMS nebo CRM vědí o typických nástrahách oboru.
- **Bez vendor lock-inu.** Vygenerované soubory jsou obyčejný markdown a YAML, které si můžete přepsat.

## Co vygenerujete

| Soubor | K čemu slouží |
| --- | --- |
| `.github/copilot-instructions.md` | Hlavní kontext, který Copilot načítá vždy. Architektura, stack, pravidla a skills. |
| `AGENTS.md` | Stejná pravidla pro ostatní AI agenty a nástroje. |
| `.github/workflows/copilot-setup-steps.yml` | Prostředí pro coding agenta, tedy Node, pnpm a databáze. |
| `.github/skills/SKILL.md` | Podrobné postupy a kontrolní seznamy. Jen v rozšířeném formátu. |
| `.github/agents/agent-task.agent.md` | Definice agenta pro plnění úloh. Jen v rozšířeném formátu. |
| `.github/prompts/<slug>.prompt.md` | Úkolový prompt ke vložení do chatu. Volitelně. |
| `PROJECT_PLAN.md` | Rozdělení práce do fází. Volitelně. |
| `project.config.json` | Strojově čitelný souhrn voleb. |
| `README.md` | Startovní README pro váš projekt. |
| `.env.example` | Přehled proměnných prostředí bez hodnot. |
| `.agentic/manifest.json` | Kontext pro agentní nástroje. Volitelně. |
| `CONTRIBUTING.md` | Postup pro přispěvatele. Volitelně. |

## Tři formáty výstupu

Formát se volí v kartě **Formát výstupu** na záložce Skills.

| Formát | Co obsahuje | Kdy se hodí |
| --- | --- | --- |
| **Konsolidovaný** | Instrukce, agent, setup a základní projektové soubory. | Chcete jeden velký kontext a nic víc. Výchozí volba. |
| **Rozšířený** | Navíc `SKILL.md` a definice agenta pro úlohy. | Máte větší projekt a chcete skills rozdělené do souborů. |
| **Jen instrukce** | Pouze to, co Copilot opravdu načítá. | Nechcete do repozitáře nic navíc. |

> [!NOTE]
> Přesný seznam souborů pro vaše volby vidíte v aplikaci na záložce **Projekt**. Shodu tohoto seznamu se skutečným výstupem generátoru hlídá test.

## Jak se to ovládá

Aplikace má tři vrstvy, mezi kterými se dá volně přeskakovat:

1. **Průvodce na záložce Presety.** Pět kroků, kde nastavíte název projektu, doménu, cílovou platformu, framework a volnou specifikaci. Dole jsou rychlé šablony pro doménu, framework, mobil a cílové platformy.
2. **Detailní záložky.** Architektura, Frontend, Backend, DevOps, Bezpečnost, Funkce, Moduly, Mobil a Chování. Každá obsahuje karty s volbami, které se propisují do výstupu.
3. **Skills a výstup.** Na záložce Skills vyberete postupy, které se vloží do instrukcí. Tlačítkem **Vygenerovat soubory** vznikne náhled, odkud je zkopírujete nebo stáhnete.

V náhledu jde uložit jednotlivý soubor, nebo si stáhnout **všechno najednou jako ZIP**. Archiv zachová cesty včetně složek, takže se dá rozbalit přímo do kořene repozitáře a nic nemusíte přemisťovat.

Doplňky, které se hodí znát:

- Volby se ukládají do `localStorage`, takže obnovení stránky nic neztratí. Tlačítko **Reset** vrátí výchozí stav.
- Vyhledávací pole v hlavičce záložky hledá v názvech voleb i v textu nápovědy.
- Najeďte na volbu a uvidíte vysvětlení. Celý slovník je na záložce **Slovník**.
- Konfiguraci lze uložit do `builder-config.json` a později načíst, takže se dá sdílet nebo verzovat.
- V okně s výstupem zavře `Esc`, obsah jde kopírovat nebo stáhnout.

## Stažení jako ZIP

Tlačítko **Stáhnout vše (.zip)** zabalí všechny vygenerované soubory do jednoho archivu. Název se odvodí z názvu projektu, takže `Můj E-shop 2026` dá `muj-e-shop-2026.zip`.

Archiv se sestavuje přímo v prohlížeči a bez externí knihovny, protože projekt drží v produkci jen React. Zápis formátu ZIP i CRC32 jsou v `src/lib/zip.ts`.

Komprese jde přes nativní `CompressionStream('deflate-raw')`. Když ji prohlížeč neumí, soubory se uloží nekomprimovaně. Takový archiv je pořád platný, jen větší. Naměřená úspora na osmi typických souborech je **63 %** (33 kB na 12 kB).

> [!NOTE]
> Dřív se pouštělo víc stažení za sebou, jenže prohlížeče takové chování blokují a uživatel dostal jen první soubor. Jeden archiv je spolehlivější a taky praktičtější.

## Spuštění lokálně

Potřebujete Node.js 20 nebo novější a pnpm.

```bash
git clone https://github.com/Crazyka51/Copilot-instructions-builder.git
cd Copilot-instructions-builder
pnpm install
pnpm dev
```

Aplikace poběží na `http://localhost:3000`. Port je pevně daný ve `vite.config.ts`, takže se nevybere náhodný jiný.

```bash
pnpm build     # produkční build do dist/
pnpm preview   # náhled produkčního buildu
```

Build je statický, takže `dist/` nasadíte na GitHub Pages, Netlify nebo Vercel bez konfigurace serveru.

## Jak je to postavené

```mermaid
flowchart LR
    DATA["src/data<br/>karty, presety, skills, nápovědy"] --> STATE["src/lib/state.ts<br/>výběr voleb a presety"]
    DATA --> GEN["src/lib/generate.ts<br/>sestavení souborů"]
    TPL["src/lib/templates.ts<br/>textové šablony"] --> GEN
    STATE --> GEN
    UI["React UI<br/>App.tsx a components"] --> STATE
    GEN --> OUT["sada souborů<br/>ke zkopírování do repozitáře"]
```

Rozhraní drží volby ve stavu, generátor z nich a ze šablon sestaví výsledné soubory. Klíčové moduly:

| Soubor | Co dělá |
| --- | --- |
| `src/lib/state.ts` | Drží výběr voleb, aplikuje presety a načítá uloženou konfiguraci. |
| `src/lib/generate.ts` | Sestaví soubory z voleb a šablon, včetně obalení markery. |
| `src/lib/templates.ts` | Textové šablony vygenerovaných souborů. |
| `src/data/` | Karty, presety, katalog skills a texty nápovědy. |
| `src/components/` | Jednotlivé části rozhraní. |

> [!IMPORTANT]
> Soubory `src/lib/templates.ts` a vše v `src/data/` jsou **generované**. Ruční úpravy přepíše příkaz `pnpm run extract`.

## Kontrola kvality

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # ESLint, flat config
pnpm test        # 43 testů přes node:test a tsx
pnpm smoke       # 28 presetů krát 3 formáty
```

Aktuální stav:

| Kontrola | Výsledek |
| --- | --- |
| Typová kontrola | 0 chyb |
| Lint | 0 problémů |
| Testy | 43 z 43 |
| Smoke test | prochází |

Testy pokrývají stav voleb a presety, konfiguraci a její načtení, generátor včetně markerů a validity JSON, a také integritu dat. Ta poslední skupina odhalí třeba to, že preset odkazuje na volbu, která už v datech není.

## Ruční záplaty nápovědy

Několik textů nápovědy v datech chybí nebo se liší jen velikostí písmen. Takové opravy patří do `scripts/patches.json`, odkud je `pnpm run extract` aplikuje na konci:

- `helpAliases` pro klíč nápovědy, který se v datech liší jen velikostí písmen.
- `helpExtra` pro úplně chybějící text nápovědy.

Díky tomu se oprava neztratí při další regeneraci dat, což je u generovaných souborů jinak běžný problém. Na chybějící nápovědu upozorní i test.

## Struktura projektu

<details>
<summary>Rozbalit strom souborů</summary>

```
src/
  App.tsx                 orchestrace stavu a rozvržení
  main.tsx                vstupní bod
  styles.css              emerald dark theme
  components/
    TopBar.tsx            název projektu, stav a hlavní akce
    Sidebar.tsx           záložky ve skupinách a ukazatel průběhu
    TabHeader.tsx         název záložky, filtr a hromadné akce
    CardGrid.tsx          mřížka karet jedné záložky
    CardView.tsx          jedna karta voleb
    PresetsTab.tsx        průvodce a rychlé šablony
    SkillsTab.tsx         volby skillů a knihovna podle kategorií
    ProjectTab.tsx        přehled generovaných souborů
    DictionaryTab.tsx     slovník nápovědy
    OutputModal.tsx       náhled a uložení výstupu
    FooterBar.tsx         souhrn a hlavní akce
  lib/
    templates.ts          GENEROVÁNO, needitujte ručně
    generate.ts           generátor
    state.ts              výběr, presety, konfigurace
    help.ts               nápověda voleb
    filter.ts             filtrování karet a voleb
    ui.ts                 záložky, kroky průvodce, seznam souborů
    download.ts           stahování souborů
    usePersistentState.ts stav v localStorage
    types.ts              sdílené typy
    *.test.ts             testy
  data/                   GENEROVÁNO
scripts/
  extract.mjs             regenerace dat
  to-ts.mjs               převod šablon do TypeScriptu
  gen-ts.ts               spuštění generátoru mimo prohlížeč
  smoke.ts                smoke test
  patches.json            ruční záplaty nápovědy
public/
  _headers               bezpečnostní hlavičky pro Netlify a Cloudflare Pages
vercel.json              bezpečnostní hlavičky pro Vercel
docs/
  banner.svg              banner pro README
```

</details>

## Bezpečnostní hlavičky

Aplikace je statický web, takže hlavičky nastavuje každý hosting zvlášť. V repu jsou proto na všech místech, odkud se dá nasadit:

| Soubor | Kde se uplatní |
| --- | --- |
| `vite.config.ts` | Lokální vývoj a `pnpm preview` |
| `public/_headers` | Netlify a Cloudflare Pages |
| `vercel.json` | Vercel |

Zatím se posílá `X-Content-Type-Options: nosniff`. Prohlížeč díky tomu zpracuje soubor jen podle deklarovaného typu a nezkouší hádat jiný. Soubor označený jako text se tak nikdy nevykoná jako skript.

> [!NOTE]
> Hlavičku **nelze** nastavit meta tagem v `index.html`, prohlížeče u ní meta tag ignorují. Musí přijít v HTTP odpovědi, proto jsou konfigurace pro hosting.

Aby hodnoty nezůstaly někde zapomenuté, hlídá je test `src/lib/security-headers.test.ts`. Ten si načte skutečnou konfiguraci Vite a zkontroluje i oba soubory pro hosting.

**GitHub Pages** vlastní hlavičky nepodporuje. Pokud tam aplikaci nasadíte, hlavička se nepošle a je potřeba vložit proxy nebo CDN, které je přidá.

Výsledek ověření:

```
dev server     X-Content-Type-Options: nosniff
preview (HTML) X-Content-Type-Options: nosniff
preview (JS)   X-Content-Type-Options: nosniff
```

## Poznámky pro vývojáře

- Zdroj pravdy pro závislosti je `pnpm-lock.yaml`. Soubor `package-lock.json` je pozůstatek z npm a můžete ho smazat.
- Konfigurace pnpm je v `pnpm-workspace.yaml`. Od pnpm 10 se pole `pnpm` v `package.json` ignoruje, proto je povolení build skriptu pro `esbuild` tam.
- Karty na záložce Skills mají konfigurační klíč ve tvaru `Skills|<název>`, stejně jako kategorie skills. Načítání konfigurace proto nejdřív zkouší kartu a teprve pak kategorii.
- Presety **neobsahují** radio karty domény, frameworku, mobilu a cíle. Hodnotu těchto karet zapisuje funkce `applyPresetWithTrigger`, jinak by ji průvodce nikdy neuložil.
- Funkce `polish()` převádí `Nespecifikováno` na `neuvedeno` v textových výstupech. JSON konfigurace zůstává bez této úpravy.
- Animace respektují `prefers-reduced-motion`.

## Časté otázky

**Posílá se něco na server?**
Ne. Všechno se počítá v prohlížeči, včetně generování souborů. Volby zůstávají ve vašem `localStorage`.

**Funguje to offline?**
Po `pnpm build` ano. Výsledek je statický web bez backendu.

**Můžu si vygenerované soubory přepsat?**
Ano a klidně je to i žádoucí. Slouží jako startovní bod, ne jako něco, co se nesmí měnit.

**Proč se soubory stahují jako ZIP?**
Protože prohlížeče blokují víc stažení spuštěných najednou, takže by dorazil jen první soubor. Archiv navíc drží cesty ke složkám, takže se rozbalí přímo do repozitáře.

## Licence

[MIT](LICENSE). Projekt můžete používat, upravovat, šířit i prodávat. Stačí zachovat uvedení autora a text licence.

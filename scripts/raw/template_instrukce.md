# Architektonická specifikace: $($projName)

Jsi v kontextu moderního, enterprise-ready projektu. Následující direktivy definují strukturu a nástroje, které **MUSÍŠ** při generování dodržovat.

## 1. Základní Architektura
* **Repozitář:** $($vals.Arch)
* **Typ architektury:** $($vals.ArchType)
* **Rendering strategie:** $($vals.Render)
* **Cílové platformy:** $($vals.Target)
* **Cílové nasazení:** $($vals.Deploy)
* **IaC:** $($vals.Iac)

## 2. Správa obsahu, Meta dat a i18n
* **Strategie textového obsahu:** $($vals.Cms)
* **CMS Editor:** $($vals.CmsEditor)
* **Admin Shell:** $($vals.AdminShell)
* **Správa Meta Tagů (SEO):** $($vals.Seo)
* **Internacionalizace:** $($vals.I18n)

**Kritické pravidlo pro UI:** UI komponenty nesmí obsahovat "hardcoded" texty. Veškerý textový obsah musí být načítán dynamicky.

## 3. Tech Stack
* **Frontend:** $(StackPair $vals.Fe $vals.Css)
* **Design System & Vibe:** $($vals.Design)
* **State Management:** $($vals.State)
* **Formuláře a validace:** $($vals.Forms)
* **Animace:** $($vals.Animation)
* **Backend:** $($vals.Be)
* **Databázová strategie:** $($vals.DbStrategy)
* **Integrace s Vercel DB:** $($vals.VercelDb)
* **ORM / Data Layer:** $($vals.Orm)
* **Data Fetching:** $($vals.Fetch)
* **Real-time komunikace:** $($vals.Realtime)
* **Connection Pooling:** $($vals.Pooling)
* **Cache strategie:** $($vals.Cache)
* **API Design:** $($vals.ApiDesign)

## 4. Kvalita, Bezpečnost a Observability
* **Standardy kódu:**
$($lists.Lint)

* **Testování:**
$($lists.Test)

* **Typ autentizace:** $($vals.AuthType)
* **Autentizace & Role:**
$($lists.Auth)

* **Bezpečnostní moduly:**
$($lists.Sec)

* **Observability & Analytics:**
$($lists.Observability)

* **Logování:**
$($lists.Log)

* **Compliance:**
$($lists.Compliance)

## 5. DevOps a CI/CD
* **CI/CD Pipeline:**
$($lists.CiCd)

* **Vercel konfigurace:**
$($lists.VercelFeatures)

## 6. Implementované Moduly
**Administrace:**
$($lists.Admin)

**Byznys Funkce:**
$($lists.Core)

**AI Moduly:**
$($lists.Ai)

**A/B Testování:** $($vals.AbTesting)

**Frontend UI utility:**
$($lists.FeUi)
$($neonSection)
$($supabaseSection)
$($vercelSection)
$($tipTapSection)
$($specializedSection)
$($legalSection)
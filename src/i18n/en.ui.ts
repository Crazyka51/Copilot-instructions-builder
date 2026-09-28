// Anglické překlady rozhraní: popisky tlačítek, nadpisy, hlášky, názvy záložek
// a jazyky předstránky. Klíčem je vždy původní český text.
export const enUi: Record<string, string> = {
  // ---------- horní lišta ----------
  'Název projektu': 'Project name',
  'Název projektu. Nastavíte ho v průvodci.': 'Project name. You set it in the wizard.',
  'Uložit konfiguraci': 'Save configuration',
  'Načíst konfiguraci': 'Load configuration',
  'Reset': 'Reset',
  'Vygenerovat soubory': 'Generate files',
  'Uloží volby do souboru builder-config.json': 'Saves your choices to builder-config.json',
  'Načte volby ze souboru builder-config.json': 'Loads your choices from builder-config.json',
  'Smaže všechny volby a vrátí výchozí stav': 'Clears every choice and returns to defaults',
  'Jazyk rozhraní': 'Interface language',
  'Přepnout jazyk': 'Switch language',
  'voleb': 'choices',

  // ---------- boční panel ----------
  'Záložky průvodce': 'Wizard tabs',
  'Vybrané volby': 'Selected choices',
  'Počet vybraných voleb': 'Number of selected choices',
  'Start': 'Start',
  'Rozsah': 'Scope',
  'Kvalita': 'Quality',
  'Pomoc': 'Help',
  'Další': 'More',

  // ---------- hlavička záložky ----------
  'Hledat volbu nebo nápovědu…': 'Search options or help…',
  'Hledat volbu nebo nápovědu': 'Search options or help',
  'Zrušit': 'Clear',
  'Vyčistit záložku': 'Clear tab',

  // ---------- karty ----------
  'jedna volba': 'single choice',
  'více voleb': 'multiple choices',
  'Vybrané volby z celku': 'Selected out of total',
  'Volitelné: vyberte jednu možnost, nebo nechte nevybráno.': 'Optional: pick one option or leave it empty.',
  'Volitelné moduly a integrace.': 'Optional modules and integrations.',
  'Žádná volba neodpovídá filtru.': 'No option matches the filter.',
  'Vybrat vše': 'Select all',
  'Vyčistit': 'Clear',
  'Tato záložka neobsahuje žádné volby.': 'This tab has no options.',
  'Nic nenalezeno. Zkuste jiný výraz, nebo filtr vyčistěte.': 'Nothing found. Try another term or clear the filter.',

  // ---------- spodní lišta ----------
  'Vybráno {count} voleb': 'Selected {count} choices',
  'formát {format}': 'format {format}',
  'vygeneruje se {count} souborů': '{count} files will be generated',

  // ---------- projekt ----------
  'Aktuální formát výstupu: {format}': 'Current output format: {format}',
  'Vygeneruje se {count} souborů:': '{count} files will be generated:',

  // ---------- skills ----------
  'Knihovna skills ({count})': 'Skill library ({count})',
  'Odznačit všechny': 'Deselect all',
  'Vybrat všechny': 'Select all',
  'Vyberte postupy, které se vloží do instrukcí. Najeďte na název pro popis. Vybraných: {count}.': 'Pick the procedures to include in the instructions. Hover a name to see its description. Selected: {count}.',

  // ---------- slovník ----------
  'Slovník nápovědy ({count})': 'Help dictionary ({count})',
  'Vyhledejte volbu a zobrazí se plné vysvětlení. Stejný text se zobrazuje i v tooltipu u voleb.': 'Search for an option to see the full explanation. The same text appears in option tooltips.',
  'Hledat v nápovědě…': 'Search the help…',
  'Hledat v nápovědě': 'Search the help',
  '{count} položek': '{count} items',
  'Položky nápovědy': 'Help entries',
  'Nic nenalezeno': 'Nothing found',
  'Vyberte položku ze seznamu.': 'Pick an entry from the list.',

  // ---------- výstupní okno ----------
  'Vygenerované soubory ({count})': 'Generated files ({count})',
  'Vygenerované soubory': 'Generated files',
  'Zavřít': 'Close',
  '{lines} řádků · {chars} znaků': '{lines} lines · {chars} characters',
  'Kopírovat': 'Copy',
  'Zkopírováno': 'Copied',
  'Uložit tento': 'Save this file',
  'Stáhnout vše (.zip)': 'Download all (.zip)',
  'Vytvářím ZIP…': 'Creating ZIP…',
  'Zabalí všechny soubory do jednoho archivu ZIP včetně cest.': 'Packs all files into a single ZIP archive, folder structure included.',

  // ---------- průvodce ----------
  'Průvodce založením projektu': 'Project setup wizard',
  'Projděte krok za krokem. Volby se propisují do ostatních záložek a doporučené moduly se předvyplní podle presetu.': 'Go step by step. Your choices carry over to the other tabs and the preset fills in the recommended modules.',
  'Projekt': 'Project',
  'Cíl': 'Goal',
  'Technologie': 'Technology',
  'Specifikace': 'Specification',
  'Souhrn': 'Summary',
  'Co má projekt řešit?': 'What should the project do?',
  'Popište výsledek vlastními slovy. Text se uloží do PROJECT_PLAN.md a README.md.': 'Describe the outcome in your own words. The text goes into PROJECT_PLAN.md and README.md.',
  'Doména projektu': 'Project domain',
  'Cílová platforma': 'Target platform',
  '- nevybráno -': '- not selected -',
  'Frontend framework': 'Frontend framework',
  'Před aplikací presetu vyčistit doporučené skupiny': 'Clear recommended groups before applying a preset',
  'Co vytváří': 'What it builds',
  'Pro koho to vytváří': 'Who it is for',
  'Jaké technologie použít': 'Which technologies to use',
  'Jaké funkce implementovat': 'Which features to implement',
  'Jaké soubory vytvořit': 'Which files to create',
  'Závislosti nepřidávat bez důvodu': 'Do not add dependencies without reason',
  'Doména': 'Domain',
  'Platforma': 'Platform',
  'Mobil': 'Mobile',
  'Vybraných voleb': 'Selected choices',
  '(neuvedeno)': '(not specified)',
  '(nevybráno)': '(not selected)',
  '‹ Zpět': '‹ Back',
  'Další ›': 'Next ›',
  'Hotovo, vygenerovat': 'Done, generate',
  'Krok {step} z {total}': 'Step {step} of {total}',
  'Rychlé šablony (presety)': 'Quick templates (presets)',
  'Kliknutím na preset se doplní doporučené volby. Poté je můžete libovolně upravit nebo odznačit.': 'Click a preset to fill in the recommended choices. You can then edit or uncheck them freely.',

  // ---------- hlášky ----------
  'Preset „{label}“ aplikován: doplněno {added} doporučených voleb. Můžete je odznačit.': 'Preset "{label}" applied: {added} recommended choices added. You can uncheck them.',
  'Preset „{label}“ nemá doporučené volby, vyplňte volby ručně.': 'Preset "{label}" has no recommended choices. Fill them in manually.',
  'Záložka „{tab}“ vyčištěna: odznačeno {count} voleb.': 'Tab "{tab}" cleared: {count} choices unchecked.',
  'Konfigurace uložena do builder-config.json.': 'Configuration saved to builder-config.json.',
  'Konfigurace načtena: obnoveno {count} voleb.': 'Configuration loaded: {count} choices restored.',
  'Načtení selhalo: {message}': 'Loading failed: {message}',
  'Soubor se nepodařilo přečíst.': 'The file could not be read.',
  'Stav byl obnoven do výchozího nastavení.': 'Everything has been reset to defaults.',

  // ---------- záložky ----------
  'Presety': 'Presets',
  'Architektura': 'Architecture',
  'Frontend': 'Frontend',
  'Backend': 'Backend',
  'DevOps': 'DevOps',
  'Bezpečnost': 'Security',
  'Funkce': 'Features',
  'Moduly': 'Modules',
  'Skills': 'Skills',
  'Chování': 'Behaviour',
  'Slovník': 'Dictionary',

  // ---------- formáty výstupu ----------
  'Konsolidovaný': 'Consolidated',
  'Rozšířený': 'Extended',

  // ---------- předstránka ----------
  'Vyberte jazyk': 'Choose your language',
  'Načítám…': 'Loading…',
  'Připravuji prostředí': 'Preparing the environment'
}

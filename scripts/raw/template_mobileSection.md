
# Mobilní aplikace
* **Platforma:** $($vals.Mobile)
* **Distribuce:** $($vals.MobileDeploy)
* **Navigace:** $($vals.MobileNav)
* **UI knihovna:** $($vals.MobileUi)
* **State & Data:** $($vals.MobileState)
* **Autentizace:** $($vals.MobileAuth)

### Mobilní funkce:
$($lists.MobileFeatures)

### Pravidla pro mobilní část:
- **Sdílené typy:** Vytvoř ``packages/shared-types/`` s TypeScript typy sdílenými mezi webem a mobilem
- **API klient:** Sdílený API klient s automatickým refresh token flow
- **Offline-first:** Drafty a kritická data ukládej do AsyncStorage, synchronizuj při připojení
- **Bezpečnost:** Tokeny VŽDY v SecureStore (nikdy AsyncStorage)
- **Build:** ``eas build --platform android --profile preview`` pro testovací APK

    Function Get-AntiPatterns {
        $fence = [string]::new([char]96, 3)
        $badGood = @()
        $badGood += @"
### 1. Texty napevno v komponentě

$fence
// ŠPATNĚ - text nejde přeložit ani upravit bez zásahu do kódu
<h1>Moje aplikace</h1>

// SPRÁVNĚ - text pochází ze slovníku
<h1>{t('header.title')}</h1>
$fence
"@
        $badGood += @"
### 2. Přímý přístup k databázi z komponenty

$fence
// ŠPATNĚ - komponenta obchází vrstvy a obchází kontrolu oprávnění
const data = await db.query('SELECT * FROM users')

// SPRÁVNĚ - přístup jde přes serverovou vrstvu
const data = await getUsers()
$fence
"@
        $badGood += @"
### 3. Tajemství v klientském kódu

$fence
# ŠPATNĚ - cokoli s předponou NEXT_PUBLIC_ nebo VITE_ je veřejné!
NEXT_PUBLIC_API_KEY=sk_live_xxxxx

# SPRÁVNĚ - veřejná je jen adresa, klíč zůstává na serveru
NEXT_PUBLIC_API_URL=https://api.example.com
PRIVATE_API_KEY=sk_live_xxxxx
$fence
"@
        $badGood += @"
### 4. Obcházení typového systému

$fence
// ŠPATNĚ - přetypováním ztratíš kontrolu
const user = data as any

// SPRÁVNĚ - ověř tvar dat, dokud nejsou ověřená
const user = userSchema.parse(data)
$fence
"@
        $badGood += @"
### 5. Ověřování oprávnění na klientu

$fence
// ŠPATNĚ - uživatel si roli přepíše v prohlížeči
if (user.role === 'admin') { deleteUser(id) }

// SPRÁVNĚ - rozhoduje server, klient jen skrývá UI
await deleteUser(id) // uvnitř si server ověří roli
$fence
"@
        $badGood += @"
### 6. Nejdřívější návrat přes hluboké podmínky

$fence
// ŠPATNĚ - hluboké zanoření se špatně čte
function render(user) {
  if (user) {
    if (user.active) {
      if (user.email) {
        return user.email
      }
    }
  }
}

// SPRÁVNĚ - okrajové stavy vyřeš hned na začátku
function render(user) {
  if (!user || !user.active || !user.email) return null
  return user.email
}
$fence
"@
        return "## Anti-patterns: co nikdy nedělat`n`nToto jsou zakázané vzory. Když je v kódu najdeš, oprav je.`n`n" + ($badGood -join "`n")
    }
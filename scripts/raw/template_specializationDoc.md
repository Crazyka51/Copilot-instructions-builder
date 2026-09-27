# Specializované moduly: $($projName)

## Primární doména
**$($vals.AppDomain)**

## Aktivní moduly

### E-shop
$($lists.Ecommerce)

### Rezervace
$($lists.Booking)

### SaaS
$($lists.Saas)

### LMS
$($lists.Lms)

### CRM
$($lists.Crm)

## Externí integrace
$($lists.Integrations)

## Marketing
$($lists.Marketing)

## Právní požadavky
$($lists.Legal)

## Doporučené knihovny

| Modul | Knihovna | Účel |
|-------|----------|------|
| E-shop platby | ``stripe`` | Platební brána |
| E-shop platby CZ | ``gopay-sdk`` | CZ platební brána |
| Doprava CZ | ``packeta-api`` | Integrace Packeta |
| Fakturace | ``fakturoid-client`` | Fakturace CZ |
| Email | ``resend`` | Transakční e-maily |
| SMS | ``twilio`` | SMS notifikace |
| Rezervace | ``date-fns-tz`` | Timezone handling |
| Rezervace | ``rrule`` | Opakované události |
| SaaS billing | ``@stripe/stripe-js`` | Client-side checkout |
| SaaS multi-tenant | ``@supabase/ssr`` | RLS + tenant isolation |
| LMS video | ``@mux/mux-node`` | Video streaming |
| CRM pipeline | ``@dnd-kit/core`` | Drag & drop deals |
| Marketing | ``@react-email/components`` | Email šablony |
| Compliance | ``cookiebot`` | GDPR cookies |
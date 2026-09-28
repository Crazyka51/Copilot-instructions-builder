import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Bezpečnostní hlavičky posílané u každé odpovědi.
 *
 * `X-Content-Type-Options: nosniff` zakáže prohlížeči MIME sniffing. Prohlížeč
 * pak soubor zpracuje jen podle deklarovaného Content-Type, takže se například
 * soubor deklarovaný jako text nevykoná jako skript. Hlavičku nelze nastavit
 * přes meta tag, musí přijít z HTTP odpovědi.
 *
 * Stejné hodnoty jsou zopakované v `public/_headers` (Netlify, Cloudflare Pages)
 * a ve `vercel.json`, protože statické hostování si je čte samo. Drží je v souladu
 * test `src/lib/security-headers.test.ts`.
 */
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff'
}

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
    strictPort: true,
    headers: securityHeaders
  },
  preview: {
    port: 3000,
    strictPort: true,
    headers: securityHeaders
  },
  build: { outDir: 'dist', sourcemap: false }
})


### TipTap editor konfigurace
- Použij **@tiptap/react** + **@tiptap/starter-kit** jako základ
- Pro uložení používej **JSON formát** (ne HTML)
- Vlastní extensiony: vytvoř ``extensions/`` složku pro vlastní node/mark typy
- Renderuj obsah bezpečně pomocí **generateHTML()** z ``@tiptap/html`` na serveru
- **Nikdy nepoužívej dangerouslySetInnerHTML** bez předchozí sanitizace
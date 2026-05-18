<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key gotchas:
- Middleware was renamed to **Proxy**: file lives at `src/proxy.ts` and exports a `proxy` function (see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`).
- Route segment `params` and `searchParams` are `Promise<>` — always `await` them.
<!-- END:nextjs-agent-rules -->

# CSS rules

Before modifying any `.module.css`, `globals.css`, or adding styles to a component, read [`docs/CSS-AGENT.md`](docs/CSS-AGENT.md). It is the single source of truth for tokens, allowed patterns, and forbidden anti-patterns.

Hard rules (the long version is in the guide):

1. No `style={{...}}` inline in JSX (CSS-variable injection is the only exception).
2. No hardcoded colors, radii, spacing or transitions — always `var(--token)`.
3. CSS Modules per component, mobile-first media queries (`min-width`).
4. Dark mode must be verified before closing the PR.

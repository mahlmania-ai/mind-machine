# Mind + Machine

The Mahlmania site opens in the Mind garden. Use **All screens** or go to `/explore/` to reach the Machine vault, Markets research desk, Chicago floor proposal, Atlas, Founder OS, personal dashboard, portfolio, services, story studios and site guide.

Use Node.js 24 and `npm ci`. Run `npm run dev` for the React screens. Run `npm run build:site` to assemble the production site in `dist/`, including the separate Atlas application and the direct-entry page for each screen.

Vercel builds the repository root. The Founder OS link opens its separate protected deployment with a read-only sample company. Markets uses illustrative data. Personal dashboard entries stay in the visitor’s browser.

Atlas uses a pinned upstream revision and includes its attribution and data notices. Publication of the two third-party datasets for commercial use requires separate rights review. See [the Atlas build notes](atlas/README.md).

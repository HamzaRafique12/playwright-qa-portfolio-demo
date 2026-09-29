# Playwright QA Portfolio Demo

A personal demonstration of web UI testing with Playwright and TypeScript. The tests run against Playwright's public TodoMVC demo application. This is not client work.

## Coverage

- Add a task, verify it appears, and mark it complete
- Verify the Active filter shows unfinished tasks and hides completed tasks
- Run both scenarios in Chromium, Firefox, and WebKit

## Run locally

1. Install Node.js and project dependencies: `npm install`
2. Install browser binaries: `npx playwright install`
3. Run the suite: `npx playwright test`
4. Open the HTML report: `npx playwright show-report`

The latest local run completed with 6 passing browser tests. Results depend on the public demo site's availability.
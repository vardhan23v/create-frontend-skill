# Changelog

## 3.0.0 — 2026-10-04

Production-hardening pass. Structure and terminology of 2.0.0 preserved; sections renumbered to fit the additions.

### Added
- Step 0: project classification (new / existing / partially implemented / needs refactoring) with handling rules for each, in front of the existing task-sizing table
- Step 1: run existing install, typecheck, lint, test and build once before changing anything; record pre-existing failures
- Step 2: requirements table with a "default when not stated" and "ask when" column, covering purpose, flows, data, auth and roles, responsive and browser support, accessibility, SEO, performance, states, references, deploy target, env variables and integrations
- Step 3: explicit six-level stack priority and a decision table covering framework, language, styling, component library, state, routing, data fetching, forms, testing and build tooling
- Step 4: backend boundary — trigger list, six rules, API contract location and content, labelled-mock policy
- Step 6: "avoid the generic AI look" guidance; how to analyse a supplied design reference
- Step 7: explicit responsive checklist (navigation, typography, grids, tables, forms, dialogs, buttons, images, overflow, touch); "ARIA only when native semantics cannot express it"; form retry; URL handling; public vs private environment variable table; secret scan of the diff; structured data in SEO; SEO explicitly skipped for private apps
- Step 8: re-render, duplicate-request and Next.js client-component checks
- Step 9: testing decision table (write for / skip for)
- Step 10: verification split into seven categories (code, types, build, tests, browser, visual, accessibility) with the rule for unavailable tools; the literal `BROWSER VERIFICATION: NOT AVAILABLE` block with manual steps; accessibility interaction verification
- Step 11: failure recovery loop with a retry limit and blocker handling; two new rows in the common-failures table
- Step 12: framework-specific deployment requirements, common deployment risks, safe deploy workflow when deployment is requested
- Step 13: fixed-format verification report
- README: supported project types, verification levels, browser verification behaviour, failure/recovery behaviour, Validation Status

### Changed
- Definition of done and Rules updated for the backend boundary, pre-existing failures and the "never claim a verification you did not run" rule
- Frontmatter description now covers existing and partially built projects

### Kept from 2.0.0
- Task sizing, project reading list, package-manager detection, framework-idiom rule, scaffold commands, structure, design tokens, build subsections, performance targets, tests levels, common failures, deploy table, definition of done, rules

## 2.0.0 — 2026-10-04

- Task sizing, non-React framework support, stack-addition rules, forms, auth, accessibility detail, SEO, i18n, performance targets, tests, screenshot/axe/Lighthouse commands, common failures, definition of done

## 1.0.0 — 2026-10-04

- Initial nine-step workflow

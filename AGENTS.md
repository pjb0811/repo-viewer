<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Development

Use the Node version in `.nvmrc` and pnpm.

| Command            | Use                                                 |
| ------------------ | --------------------------------------------------- |
| `pnpm dev`         | Run the app locally                                 |
| `pnpm build`       | Production build                                    |
| `pnpm check-types` | Generate route types (`next typegen`) and run `tsc` |
| `pnpm lint`        | ESLint with no warnings allowed                     |
| `pnpm format`      | Prettier over the whole repository                  |

The pre-commit hook runs `lint-staged`. This is an app, not a package: it is deployed on Vercel and never published to npm, so there are no changesets.

## Structure

- `app/` holds the Next.js App Router routes. Its files only re-export from `src/`.
- `src/` follows Feature-Sliced Design layers: `app` → `pages` → `widgets` → `features` → `entities` → `shared`. A layer imports only itself and the layers below it, and only through the target slice's `index.ts` barrel. `eslint-plugin-boundaries` enforces this in `eslint.config.mjs`. `src/app` has segments (`layouts`, `styles`) rather than slices.
- `pages/` stays empty with a README. Without it, Next.js treats `src/pages/` as the Pages Router and the build fails with "`pages` and `app` directories should be under the same folder".
- The alias `@/*` points to `src/*`.
- Tailwind CSS v4 runs through `@tailwindcss/postcss` (`postcss.config.mjs`), with the theme in `src/app/styles/globals.css`.

## Comments

Write comments for someone reading the code now: say what the code does first, give a reason only when the code alone would invite the wrong change (as a present-tense constraint), and replace history with an issue number such as `(#N)`. The full rules and examples are in section "C. 주석 작성" of the shared `coding-style` skill.

## Shared skills

Procedures shared by every pjb0811 repository are global Claude Code skills in the public repository [`pjb0811/skills`](https://github.com/pjb0811/skills), and the shared decisions are in its [`global/CLAUDE.md`](https://github.com/pjb0811/skills/blob/main/global/CLAUDE.md). Agents without them installed follow the summaries in this file.

| Skill                   | Use                                                                                                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commit`, `pr`, `issue` | Commit messages, PR and issue bodies                                                                                                                                                                 |
| `coding-style`          | Conventions, renames, comments (C), boolean names (D), braces (E), subcomponent file layout (F), blank lines (G), order of code inside a component (H), feature subfolders (I), long class lists (J) |
| `shared-library-first`  | Reusable UI goes to ui-kit and hooks to use-hooks first                                                                                                                                              |
| `ref-verification`      | Read repository state from git refs, not the worktree                                                                                                                                                |
| `repo-settings`         | Align the repository's GitHub settings (merge methods, auto-merge, default-branch ruleset) with the standard                                                                                         |

### Commit messages

- `type(scope): summary`: English imperative, lowercase start, no period, no gitmoji.
- Add a scope only when the change stays in one area. Never use the branch name.
- A breaking change puts `!` after the type or scope (`refactor(api)!: …`).
- The body is `-` bullets saying concretely what changed; for a breaking change, what breaks and what replaces it.
- No trailers such as `Co-Authored-By`.

# Repo Viewer

Sign in with GitHub and browse the code of your repositories read-only, on desktop or phone. The file tree and editor come from [`@jbpark/workbench`](https://github.com/pjb0811/workbench).

> [!NOTE]
> Work in progress. This commit sets up the project; sign-in and the code view follow.

## Development

Requires the Node version in `.nvmrc` and pnpm.

```bash
pnpm install
pnpm dev
```

| Command            | Use                                                 |
| ------------------ | --------------------------------------------------- |
| `pnpm dev`         | Run the app locally                                 |
| `pnpm build`       | Production build                                    |
| `pnpm check-types` | Generate route types (`next typegen`) and run `tsc` |
| `pnpm lint`        | ESLint with no warnings allowed                     |
| `pnpm format`      | Prettier over the whole repository                  |

## License

[MIT](./LICENSE)

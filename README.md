# Repo Viewer

Sign in with GitHub and browse the code of your repositories read-only, on desktop or phone. The file tree and editor come from [`@jbpark/workbench`](https://github.com/pjb0811/workbench).

> [!NOTE]
> Work in progress. Sign-in works; the repository list and the code view follow.

## How it works

- Sign-in uses a GitHub App with read-only **Contents** permission, so the site can never write to a repository. It only sees the repositories you installed the App on.
- GitHub's user access token stays on the server, inside an encrypted, httpOnly session cookie. The browser never receives it.

## Development

Requires the Node version in `.nvmrc` and pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Fill in `.env.local` from a GitHub App you own:

| Variable               | Value                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| `GITHUB_CLIENT_ID`     | The App's Client ID                                                  |
| `GITHUB_CLIENT_SECRET` | A client secret generated on the App                                 |
| `GITHUB_APP_SLUG`      | The last part of `github.com/settings/apps/<slug>`                   |
| `SESSION_SECRET`       | At least 32 random characters, for example `openssl rand -base64 32` |

The App needs:

- redirect URIs `http://localhost:3000/api/auth/callback` and `https://<your domain>/api/auth/callback`;
- **Expire user authorization tokens** and **Request user authorization (OAuth) during installation** turned on;
- repository permission **Contents: Read-only**, and the webhook turned off.

| Command            | Use                                                 |
| ------------------ | --------------------------------------------------- |
| `pnpm dev`         | Run the app locally                                 |
| `pnpm build`       | Production build                                    |
| `pnpm check-types` | Generate route types (`next typegen`) and run `tsc` |
| `pnpm lint`        | ESLint with no warnings allowed                     |
| `pnpm format`      | Prettier over the whole repository                  |

## License

[MIT](./LICENSE)

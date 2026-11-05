import 'server-only';

import { encodePath, githubRequest } from './request';

export interface GithubRepository {
  owner: string;
  name: string;
  isPrivate: boolean;
  description: string | null;
  defaultBranch: string;
  pushedAt: string | null;
}

export interface GithubEntry {
  path: string;
  name: string;
  kind: 'file' | 'directory';
}

interface RepositoryResponse {
  name: string;
  owner: { login: string };
  private: boolean;
  description: string | null;
  default_branch: string;
  pushed_at: string | null;
}

const PAGE_SIZE = 100;

const toRepository = (repo: RepositoryResponse): GithubRepository => ({
  owner: repo.owner.login,
  name: repo.name,
  isPrivate: repo.private,
  description: repo.description,
  defaultBranch: repo.default_branch,
  pushedAt: repo.pushed_at,
});

// Reads every page of a list endpoint that wraps its items in `key`.
const readAllPages = async <T>(
  path: string,
  accessToken: string,
  key: string,
): Promise<T[]> => {
  const items: T[] = [];

  for (let page = 1; ; page += 1) {
    const separator = path.includes('?') ? '&' : '?';
    const response = await githubRequest(
      `${path}${separator}per_page=${PAGE_SIZE}&page=${page}`,
      accessToken,
    );
    const body = (await response.json()) as Record<string, T[]>;
    const batch = body[key] ?? [];

    items.push(...batch);

    if (batch.length < PAGE_SIZE) {
      return items;
    }
  }
};

/**
 * The repositories the user can reach through the App's installations, most
 * recently pushed first. A user access token sees only the repositories that
 * the App is installed on and the user can access.
 */
export const listRepositories = async (accessToken: string) => {
  const installations = await readAllPages<{ id: number }>(
    '/user/installations',
    accessToken,
    'installations',
  );
  const lists = await Promise.all(
    installations.map(({ id }) =>
      readAllPages<RepositoryResponse>(
        `/user/installations/${id}/repositories`,
        accessToken,
        'repositories',
      ),
    ),
  );

  return lists
    .flat()
    .map(toRepository)
    .sort((a, b) => (b.pushedAt ?? '').localeCompare(a.pushedAt ?? ''));
};

export const getRepository = async (
  accessToken: string,
  owner: string,
  repo: string,
) => {
  const response = await githubRequest(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    accessToken,
  );

  return toRepository((await response.json()) as RepositoryResponse);
};

/** The commit SHA that `ref` (a branch, tag or SHA) points to. */
export const resolveCommit = async (
  accessToken: string,
  owner: string,
  repo: string,
  ref: string,
) => {
  const response = await githubRequest(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(ref)}`,
    accessToken,
    'application/vnd.github.sha',
  );

  return (await response.text()).trim();
};

/**
 * The entries of one directory at `sha`, directories first. Submodules are
 * left out because their contents live in another repository.
 */
export const listDirectory = async (
  accessToken: string,
  owner: string,
  repo: string,
  sha: string,
  path: string,
): Promise<GithubEntry[]> => {
  const response = await githubRequest(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodePath(path)}?ref=${sha}`,
    accessToken,
  );
  const body = (await response.json()) as
    { type: string; name: string; path: string }[] | { type: string };

  if (!Array.isArray(body)) {
    return [];
  }

  return body
    .filter(entry => entry.type !== 'submodule')
    .map(entry => ({
      path: entry.path,
      name: entry.name,
      kind: entry.type === 'dir' ? ('directory' as const) : ('file' as const),
    }))
    .sort((a, b) =>
      a.kind === b.kind
        ? a.name.localeCompare(b.name)
        : a.kind === 'directory'
          ? -1
          : 1,
    );
};

/** The raw bytes of a file at `sha`. */
export const readFileBytes = async (
  accessToken: string,
  owner: string,
  repo: string,
  sha: string,
  path: string,
) => {
  const response = await githubRequest(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodePath(path)}?ref=${sha}`,
    accessToken,
    'application/vnd.github.raw+json',
  );

  return new Uint8Array(await response.arrayBuffer());
};

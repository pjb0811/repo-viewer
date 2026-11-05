// GitHub owner and repository names: letters, digits, `-`, `_` and `.`.
const NAME = /^[\w.-]+$/;
const SHA = /^[0-9a-f]{40}$/;

export interface RepositoryParams {
  owner: string;
  repo: string;
}

export const isRepositoryParams = ({ owner, repo }: RepositoryParams) =>
  NAME.test(owner) && NAME.test(repo);

export const isCommitSha = (sha: string) => SHA.test(sha);

/**
 * A path inside the repository, or `undefined` when it could leave it. `.`,
 * `..` and empty segments are rejected because `fetch` would resolve them
 * against the API URL.
 */
export const toRepositoryPath = (value: string | null) => {
  if (!value) {
    return '';
  }

  const segments = value.split('/');

  return segments.every(
    segment => segment !== '' && segment !== '.' && segment !== '..',
  )
    ? value
    : undefined;
};

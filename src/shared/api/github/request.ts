import 'server-only';

export class GithubApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'GithubApiError';
  }
}

/** Calls the GitHub REST API as the signed-in user. */
export const githubRequest = async (
  path: string,
  accessToken: string,
  accept = 'application/vnd.github+json',
) => {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: accept,
      Authorization: `Bearer ${accessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new GithubApiError(
      response.status,
      `GitHub request ${path} failed with ${response.status}`,
    );
  }

  return response;
};

/** Encodes each segment of a repository path, keeping the slashes. */
export const encodePath = (path: string) =>
  path.split('/').map(encodeURIComponent).join('/');

import 'server-only';

export interface GithubUser {
  login: string;
  name: string | null;
  avatarUrl: string;
}

export const getViewer = async (accessToken: string): Promise<GithubUser> => {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub user request failed with ${response.status}`);
  }

  const body = (await response.json()) as {
    login: string;
    name: string | null;
    avatar_url: string;
  };

  return { login: body.login, name: body.name, avatarUrl: body.avatar_url };
};

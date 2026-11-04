import 'server-only';

export interface GithubTokens {
  accessToken: string;
  /** Epoch milliseconds. Absent when the App does not expire tokens. */
  accessTokenExpiresAt?: number;
  refreshToken?: string;
  refreshTokenExpiresAt?: number;
}

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  error?: string;
  error_description?: string;
}

interface ClientCredentials {
  clientId: string;
  clientSecret: string;
}

const AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';

export const buildAuthorizeUrl = ({
  clientId,
  redirectUri,
  state,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
}) => {
  const url = new URL(AUTHORIZE_URL);

  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);

  return url.toString();
};

const requestTokens = async (
  params: Record<string, string>,
): Promise<GithubTokens> => {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new URLSearchParams(params),
  });

  if (!response.ok) {
    throw new Error(`GitHub token request failed with ${response.status}`);
  }

  const body = (await response.json()) as TokenResponse;

  // GitHub reports OAuth errors such as an expired code with status 200.
  if (!body.access_token) {
    throw new Error(
      `GitHub token request failed: ${body.error_description ?? body.error ?? 'no access token'}`,
    );
  }

  const now = Date.now();

  return {
    accessToken: body.access_token,
    accessTokenExpiresAt: body.expires_in
      ? now + body.expires_in * 1000
      : undefined,
    refreshToken: body.refresh_token,
    refreshTokenExpiresAt: body.refresh_token_expires_in
      ? now + body.refresh_token_expires_in * 1000
      : undefined,
  };
};

export const exchangeCode = ({
  clientId,
  clientSecret,
  code,
  redirectUri,
}: ClientCredentials & { code: string; redirectUri: string }) =>
  requestTokens({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

export const refreshTokens = ({
  clientId,
  clientSecret,
  refreshToken,
}: ClientCredentials & { refreshToken: string }) =>
  requestTokens({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

/** Revokes one user access token. The App stays installed and authorized. */
export const revokeToken = async ({
  clientId,
  clientSecret,
  accessToken,
}: ClientCredentials & { accessToken: string }) => {
  const response = await fetch(
    `https://api.github.com/applications/${clientId}/token`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ access_token: accessToken }),
    },
  );

  // 404 means the token is already gone.
  if (!response.ok && response.status !== 404) {
    throw new Error(`GitHub token revocation failed with ${response.status}`);
  }
};

import 'server-only';

import { readSession, saveSession } from '@/entities/session';

import { refreshTokens } from '@/shared/api';
import { getGithubAppConfig } from '@/shared/config';

// Refresh a little early, so a token does not expire between this check and
// GitHub receiving the request.
const REFRESH_MARGIN_MS = 60 * 1000;

/**
 * The signed-in user's access token, refreshed and saved when it is about to
 * expire. Returns `undefined` when signed out or when the refresh fails.
 *
 * Only Route Handlers can call it, because a refresh rewrites the session
 * cookie. A failed refresh keeps the session: GitHub refresh tokens work once,
 * so a request racing another refresh fails while the other one saves the new
 * tokens.
 */
export const getAccessToken = async () => {
  const session = await readSession();

  if (!session) {
    return undefined;
  }

  const { user, tokens } = session;
  const now = Date.now();

  if (
    !tokens.accessTokenExpiresAt ||
    tokens.accessTokenExpiresAt - REFRESH_MARGIN_MS > now
  ) {
    return tokens.accessToken;
  }

  if (
    !tokens.refreshToken ||
    (tokens.refreshTokenExpiresAt !== undefined &&
      tokens.refreshTokenExpiresAt <= now)
  ) {
    return undefined;
  }

  try {
    const { clientId, clientSecret } = getGithubAppConfig();
    const fresh = await refreshTokens({
      clientId,
      clientSecret,
      refreshToken: tokens.refreshToken,
    });

    await saveSession({ user, tokens: fresh });

    return fresh.accessToken;
  } catch (reason) {
    console.error(reason);

    return undefined;
  }
};

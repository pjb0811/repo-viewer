import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import 'server-only';

import type { GithubTokens, GithubUser } from '@/shared/api';
import { getSessionSecret } from '@/shared/config';

export interface SessionData {
  user: GithubUser;
  tokens: GithubTokens;
}

// The cookie outlives the 8-hour access token so the refresh token can renew
// it; GitHub's refresh tokens last about six months.
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

const getSession = async () =>
  getIronSession<SessionData>(await cookies(), {
    cookieName: 'repo_viewer_session',
    password: getSessionSecret(),
    ttl: SESSION_TTL_SECONDS,
    cookieOptions: {
      httpOnly: true,
      // Local development runs on plain http://localhost.
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
  });

/** The signed-in user's session, or `undefined` when signed out. */
export const readSession = async (): Promise<SessionData | undefined> => {
  const { user, tokens } = await getSession();

  return user && tokens ? { user, tokens } : undefined;
};

/**
 * The signed-in user for Server Components, without the tokens.
 *
 * Unsealing the cookie checks its expiry against the current time, which
 * Cache Components only allows at request time inside a private cache scope.
 */
export const getSessionUser = async (): Promise<GithubUser | undefined> => {
  'use cache: private';

  return (await readSession())?.user;
};

/** Writes the session cookie. Only Route Handlers and Server Actions can. */
export const saveSession = async ({ user, tokens }: SessionData) => {
  const session = await getSession();

  session.user = user;
  session.tokens = tokens;
  await session.save();
};

export const clearSession = async () => {
  (await getSession()).destroy();
};

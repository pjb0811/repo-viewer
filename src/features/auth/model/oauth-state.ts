import { cookies } from 'next/headers';
import { timingSafeEqual } from 'node:crypto';
import 'server-only';

const STATE_COOKIE = 'repo_viewer_oauth_state';

/** Creates the `state` for one sign-in and remembers it for ten minutes. */
export const createOAuthState = async () => {
  const state = crypto.randomUUID();

  (await cookies()).set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // GitHub's redirect back is a top-level GET, which `lax` still sends.
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 60 * 10,
  });

  return state;
};

/** Checks `received` against the remembered state, which is used up either way. */
export const consumeOAuthState = async (received: string | null) => {
  const store = await cookies();
  const expected = store.get(STATE_COOKIE)?.value;

  store.delete({ name: STATE_COOKIE, path: '/api/auth' });

  if (!expected || !received || expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
};

import { NextResponse } from 'next/server';

import { clearSession, readSession } from '@/entities/session';

import { revokeToken } from '@/shared/api';
import { getGithubAppConfig } from '@/shared/config';

export const logout = async (request: Request) => {
  const session = await readSession();

  if (session) {
    // Signing out locally must not depend on GitHub answering.
    try {
      const { clientId, clientSecret } = getGithubAppConfig();

      await revokeToken({
        clientId,
        clientSecret,
        accessToken: session.tokens.accessToken,
      });
    } catch (reason) {
      console.error(reason);
    }
  }

  await clearSession();

  // 303 turns the form's POST into a GET of the home page.
  return NextResponse.redirect(new URL('/', request.url), 303);
};

import { NextResponse, connection } from 'next/server';

import { createOAuthState } from '@/features/auth';

import { buildAuthorizeUrl } from '@/shared/api';
import { getGithubAppConfig } from '@/shared/config';

import { getCallbackUrl } from './callback-url';

export const login = async (request: Request) => {
  // Every sign-in needs a fresh state, so the response is never prerendered.
  await connection();

  const { clientId } = getGithubAppConfig();
  const state = await createOAuthState();

  return NextResponse.redirect(
    buildAuthorizeUrl({
      clientId,
      redirectUri: getCallbackUrl(request),
      state,
    }),
  );
};

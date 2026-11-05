import { NextResponse } from 'next/server';

import { consumeOAuthState } from '@/features/auth';

import { saveSession } from '@/entities/session';

import { exchangeCode, getViewer } from '@/shared/api';
import { getGithubAppConfig } from '@/shared/config';

import { getCallbackUrl } from './callback-url';

const toHome = (request: Request, error?: string) => {
  const url = new URL('/', request.url);

  if (error) {
    url.searchParams.set('error', error);
  }

  return NextResponse.redirect(url);
};

export const callback = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const isStateValid = await consumeOAuthState(state);

  if (!isStateValid) {
    // Installing the App also authorizes the user and lands here with a
    // `code` but no `state`. That code cannot be tied to this browser, so a
    // sign-in with a state starts instead; GitHub skips the consent screen
    // for an already authorized user.
    if (!state && searchParams.has('installation_id')) {
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }

    return toHome(request, 'state');
  }

  if (!code) {
    return toHome(request, searchParams.get('error') ?? 'sign-in');
  }

  try {
    const { clientId, clientSecret } = getGithubAppConfig();
    const tokens = await exchangeCode({
      clientId,
      clientSecret,
      code,
      redirectUri: getCallbackUrl(request),
    });
    const user = await getViewer(tokens.accessToken);

    await saveSession({ user, tokens });
  } catch (reason) {
    console.error(reason);

    return toHome(request, 'sign-in');
  }

  return toHome(request);
};

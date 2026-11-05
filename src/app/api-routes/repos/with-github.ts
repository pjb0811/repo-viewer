import { NextResponse } from 'next/server';

import { getAccessToken } from '@/features/auth';

import { GithubApiError } from '@/shared/api';

const errorResponse = (status: number, message: string) =>
  NextResponse.json({ message }, { status });

/**
 * Runs `handle` with the user's access token and turns failures into JSON
 * errors: 401 when signed out, GitHub's 403, 404 and 429 as they are, and 502
 * for anything else GitHub or the network does.
 */
export const withGithub = async (
  handle: (accessToken: string) => Promise<Response>,
) => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return errorResponse(401, 'Sign in with GitHub again.');
  }

  try {
    return await handle(accessToken);
  } catch (reason) {
    if (
      reason instanceof GithubApiError &&
      [403, 404, 429].includes(reason.status)
    ) {
      return errorResponse(
        reason.status,
        reason.status === 404
          ? 'Not found, or the App is not installed on this repository.'
          : 'GitHub refused the request. Try again later.',
      );
    }

    console.error(reason);

    return errorResponse(502, 'GitHub could not be reached.');
  }
};

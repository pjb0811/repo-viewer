// Must match a redirect URI registered on the GitHub App, so it is derived
// from the origin the request came in on.
export const getCallbackUrl = (request: Request) =>
  new URL('/api/auth/callback', request.url).toString();

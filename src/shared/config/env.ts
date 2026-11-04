import 'server-only';

// Read lazily, so `next build` works without the variables and a missing one
// fails the request that needs it with its name.
const read = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }

  return value;
};

export const getGithubAppConfig = () => ({
  clientId: read('GITHUB_CLIENT_ID'),
  clientSecret: read('GITHUB_CLIENT_SECRET'),
  slug: read('GITHUB_APP_SLUG'),
});

export const getSessionSecret = () => read('SESSION_SECRET');

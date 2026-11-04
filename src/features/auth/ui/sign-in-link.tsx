// A plain link, not `next/link`: the target is a Route Handler that redirects
// to GitHub, so it must not be prefetched.
export const SignInLink = () => (
  <a
    href="/api/auth/login"
    className="bg-foreground text-background inline-flex items-center
      justify-center rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
  >
    Sign in with GitHub
  </a>
);

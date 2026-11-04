export const SignOutButton = () => (
  <form action="/api/auth/logout" method="post">
    <button
      type="submit"
      className="border-foreground/20 hover:bg-foreground/5 rounded-md border
        px-3 py-1.5 text-sm"
    >
      Sign out
    </button>
  </form>
);

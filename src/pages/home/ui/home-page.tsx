import { Suspense } from 'react';

import { AccountPanel } from './account-panel';

export const HomePage = ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => (
  <main
    className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center
      gap-6 px-4 py-16"
  >
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Repo Viewer</h1>
      <p className="text-foreground/70">
        Browse your GitHub repositories read-only, on desktop or phone.
      </p>
    </div>
    {/* The session is read per request, so it streams in behind the static shell. */}
    <Suspense fallback={<p className="text-foreground/70 text-sm">Loading…</p>}>
      <AccountPanel searchParams={searchParams} />
    </Suspense>
  </main>
);

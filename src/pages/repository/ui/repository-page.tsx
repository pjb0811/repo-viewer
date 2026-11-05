import { Suspense } from 'react';

import { RepositoryViewer } from '@/widgets/repository-viewer';

import { SignInLink } from '@/features/auth';

export const RepositoryPage = ({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) => (
  // The route params are request data, so the viewer streams in behind the
  // static shell.
  <Suspense
    fallback={<p className="text-foreground/70 p-4 text-sm">Loading…</p>}
  >
    <RepositoryViewer params={params} signIn={<SignInLink />} />
  </Suspense>
);

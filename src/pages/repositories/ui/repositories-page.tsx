import Link from 'next/link';

import { SignInLink } from '@/features/auth';

import { RepositoryList } from './repository-list';

export const RepositoriesPage = () => (
  <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
    <div className="flex flex-col gap-1">
      <Link href="/" className="text-foreground/70 text-sm hover:underline">
        ← Home
      </Link>
      <h1 className="text-2xl font-semibold">Repositories</h1>
    </div>
    <RepositoryList signIn={<SignInLink />} />
  </main>
);

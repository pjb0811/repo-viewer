'use client';

import type { ReactNode } from 'react';

import { useAsync } from '@jbpark/use-hooks';
import Link from 'next/link';

import type { GithubRepository } from '@/shared/api';
import { ApiError, fetchJson } from '@/shared/lib';

export const RepositoryList = ({ signIn }: { signIn: ReactNode }) => {
  const { status, value, error } = useAsync(
    signal => fetchJson<GithubRepository[]>('/api/repos', signal),
    [],
  );

  if (status === 'pending') {
    return <p className="text-foreground/70 text-sm">Loading repositories…</p>;
  }

  if (error) {
    return error instanceof ApiError && error.status === 401 ? (
      <div className="flex flex-col items-start gap-3">
        <p className="text-foreground/70 text-sm">{error.message}</p>
        {signIn}
      </div>
    ) : (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {error.message}
      </p>
    );
  }

  if (!value?.length) {
    return (
      <p className="text-foreground/70 text-sm">
        The App is not installed on any repository yet.{' '}
        <Link href="/" className="underline underline-offset-4">
          Choose repositories
        </Link>{' '}
        from the home page.
      </p>
    );
  }

  return (
    <ul
      className="divide-foreground/10 border-foreground/10 divide-y rounded-lg
        border"
    >
      {value.map(repo => (
        <li key={`${repo.owner}/${repo.name}`}>
          <Link
            href={`/repos/${repo.owner}/${repo.name}`}
            className="hover:bg-foreground/5 flex flex-col gap-1 px-4 py-3"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate font-medium">
                {repo.owner}/{repo.name}
              </span>
              {repo.isPrivate && (
                <span
                  className="border-foreground/20 text-foreground/70 shrink-0
                    rounded-full border px-2 text-xs"
                >
                  Private
                </span>
              )}
            </span>
            {repo.description && (
              <span className="text-foreground/70 line-clamp-2 text-sm">
                {repo.description}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
};

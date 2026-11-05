'use client';

import { type ReactNode, use, useMemo, useState } from 'react';

import { useAsync, useLocalStorage, useMediaQuery } from '@jbpark/use-hooks';
import {
  Workbench,
  type WorkbenchLayoutProps,
  createHttpAdapter,
} from '@jbpark/workbench';
import Link from 'next/link';

import type { GithubRepository } from '@/shared/api';
import { ApiError, fetchJson } from '@/shared/lib';

import { codeRenderer } from '../model/code-renderer';

type RepositoryInfo = GithubRepository & { sha: string };

export const RepositoryViewer = ({
  params,
  signIn,
}: {
  params: Promise<{ owner: string; repo: string }>;
  signIn: ReactNode;
}) => {
  const { owner, repo } = use(params);
  const isNarrow = useMediaQuery('(max-width: 767px)');
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [sidebarSize, setSidebarSize] = useLocalStorage(
    'repo-viewer:sidebar-size',
    25,
  );
  const [isTreeOpen, setIsTreeOpen] = useState(true);
  const {
    status,
    value: repository,
    error,
  } = useAsync(
    signal =>
      fetchJson<RepositoryInfo>(
        `/api/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
        signal,
      ),
    [owner, repo],
  );

  // The URLs carry the resolved commit, so every request reads one snapshot
  // even if the branch moves while the page is open.
  const adapter = useMemo(() => {
    if (!repository) {
      return undefined;
    }

    const base = `/api/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/${repository.sha}`;

    return createHttpAdapter({
      treeUrl: `${base}/tree`,
      fileUrl: `${base}/file?path={id}`,
    });
  }, [repository]);

  // Stacks the tree over the editor on a phone. A closed tree stays mounted,
  // so its expanded folders survive.
  const renderStacked = ({ sidebar, main }: WorkbenchLayoutProps) => (
    <div data-stacked-layout className="flex min-h-0 w-full flex-1 flex-col">
      <div
        className={
          isTreeOpen
            ? 'border-foreground/10 h-2/5 shrink-0 overflow-hidden border-b'
            : 'hidden'
        }
      >
        {sidebar}
      </div>
      {main}
    </div>
  );

  let body: ReactNode;

  if (status === 'pending') {
    body = <p className="text-foreground/70 p-4 text-sm">Loading…</p>;
  } else if (error) {
    body = (
      <div className="flex flex-col items-start gap-3 p-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
        {error instanceof ApiError && error.status === 401 && signIn}
      </div>
    );
  } else if (adapter) {
    body = (
      <Workbench
        adapter={adapter}
        renderEditor={codeRenderer}
        readOnly
        colorTheme={isDark ? 'dark' : 'light'}
        defaultSidebarSize={sidebarSize}
        onSidebarResize={setSidebarSize}
        renderLayout={isNarrow ? renderStacked : undefined}
      />
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <header
        className="border-foreground/10 flex shrink-0 items-center gap-3
          border-b px-3 py-2"
      >
        <Link
          href="/repos"
          aria-label="Repositories"
          className="text-foreground/70 hover:bg-foreground/5 rounded px-1"
        >
          ←
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="truncate text-sm font-semibold">
            {owner}/{repo}
          </h1>
          {repository && (
            <p className="text-foreground/70 truncate text-xs">
              {repository.defaultBranch} · {repository.sha.slice(0, 7)}
            </p>
          )}
        </div>
        {isNarrow && repository && (
          <button
            type="button"
            aria-pressed={isTreeOpen}
            onClick={() => setIsTreeOpen(open => !open)}
            className="border-foreground/20 shrink-0 rounded-md border px-3 py-1
              text-sm"
          >
            {isTreeOpen ? 'Hide files' : 'Files'}
          </button>
        )}
      </header>
      <div className="flex min-h-0 flex-1">{body}</div>
    </div>
  );
};

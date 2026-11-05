import { NextResponse } from 'next/server';

import { listDirectory } from '@/shared/api';

import {
  type RepositoryParams,
  isCommitSha,
  isRepositoryParams,
  toRepositoryPath,
} from './params';
import { withGithub } from './with-github';

// A commit never changes, so its tree and files can stay in the browser.
export const IMMUTABLE_CACHE = 'private, max-age=86400, immutable';

/**
 * One directory as `WorkbenchNode[]`: the root without `parentId`, otherwise
 * the directory whose path is `parentId`. Node ids are repository paths, and
 * directories leave `children` unset so the tree loads them on expand.
 */
export const getTreeRoute = async (
  request: Request,
  { params }: { params: Promise<RepositoryParams & { sha: string }> },
) => {
  const { owner, repo, sha } = await params;
  const path = toRepositoryPath(
    new URL(request.url).searchParams.get('parentId'),
  );

  if (
    !isRepositoryParams({ owner, repo }) ||
    !isCommitSha(sha) ||
    path === undefined
  ) {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }

  return withGithub(async accessToken => {
    const entries = await listDirectory(accessToken, owner, repo, sha, path);

    return NextResponse.json(
      entries.map(({ path: id, name, kind }) => ({ id, name, kind })),
      { headers: { 'Cache-Control': IMMUTABLE_CACHE } },
    );
  });
};

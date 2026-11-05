import { NextResponse } from 'next/server';

import { getRepository, resolveCommit } from '@/shared/api';

import { type RepositoryParams, isRepositoryParams } from './params';
import { withGithub } from './with-github';

/**
 * The repository with its default branch resolved to a commit. The viewer
 * puts that SHA in the tree and file URLs, so a branch name with `/` never
 * has to fit in a path segment and the responses can be cached.
 */
export const getRepositoryRoute = async (
  _request: Request,
  { params }: { params: Promise<RepositoryParams> },
) => {
  const { owner, repo } = await params;

  if (!isRepositoryParams({ owner, repo })) {
    return NextResponse.json(
      { message: 'Invalid repository.' },
      { status: 400 },
    );
  }

  return withGithub(async accessToken => {
    const repository = await getRepository(accessToken, owner, repo);
    const sha = await resolveCommit(
      accessToken,
      owner,
      repo,
      repository.defaultBranch,
    );

    return NextResponse.json({ ...repository, sha });
  });
};

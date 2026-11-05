import { NextResponse } from 'next/server';

import { readFileBytes } from '@/shared/api';

import { IMMUTABLE_CACHE } from './get-tree';
import {
  type RepositoryParams,
  isCommitSha,
  isRepositoryParams,
  toRepositoryPath,
} from './params';
import { withGithub } from './with-github';

// Larger files make the editor slow on a phone and are rarely read whole.
const MAX_BYTES = 1024 * 1024;
// Git's own check: a NUL byte in the first 8000 bytes means binary.
const BINARY_SNIFF_BYTES = 8000;

const describe = (bytes: Uint8Array) => {
  if (bytes.length > MAX_BYTES) {
    return `This file is ${(bytes.length / 1024 / 1024).toFixed(1)} MB, larger than the 1 MB the viewer shows.`;
  }

  if (bytes.subarray(0, BINARY_SNIFF_BYTES).includes(0)) {
    return 'This is a binary file, which the viewer does not show.';
  }

  return new TextDecoder().decode(bytes);
};

/** A file's text at `sha`, or a note in its place for binary and large files. */
export const getFileRoute = async (
  request: Request,
  { params }: { params: Promise<RepositoryParams & { sha: string }> },
) => {
  const { owner, repo, sha } = await params;
  const path = toRepositoryPath(new URL(request.url).searchParams.get('path'));

  if (!isRepositoryParams({ owner, repo }) || !isCommitSha(sha) || !path) {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }

  return withGithub(async accessToken => {
    const bytes = await readFileBytes(accessToken, owner, repo, sha, path);

    return new Response(describe(bytes), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': IMMUTABLE_CACHE,
      },
    });
  });
};

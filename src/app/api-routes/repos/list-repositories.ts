import { NextResponse } from 'next/server';

import { listRepositories } from '@/shared/api';

import { withGithub } from './with-github';

export const listRepositoriesRoute = () =>
  withGithub(async accessToken =>
    NextResponse.json(await listRepositories(accessToken)),
  );

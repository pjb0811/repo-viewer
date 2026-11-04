import Image from 'next/image';

import { SignInLink, SignOutButton } from '@/features/auth';

import { getSessionUser } from '@/entities/session';

import { getGithubAppConfig } from '@/shared/config';

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Sign-in was cancelled on GitHub.',
  state: 'The sign-in link expired or came from another tab. Try again.',
};

export const AccountPanel = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const user = await getSessionUser();

  if (!user) {
    const { error } = await searchParams;
    const message =
      typeof error === 'string'
        ? (ERROR_MESSAGES[error] ?? 'Sign-in failed. Try again.')
        : undefined;

    return (
      <div className="flex flex-col items-start gap-3">
        {message && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {message}
          </p>
        )}
        <SignInLink />
      </div>
    );
  }

  const { slug } = getGithubAppConfig();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Image
          src={user.avatarUrl}
          alt=""
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="min-w-0">
          <p className="truncate font-medium">{user.name ?? user.login}</p>
          <p className="text-foreground/70 truncate text-sm">@{user.login}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`https://github.com/apps/${slug}/installations/new`}
          className="text-sm underline underline-offset-4"
        >
          Choose repositories on GitHub
        </a>
        <SignOutButton />
      </div>
    </div>
  );
};

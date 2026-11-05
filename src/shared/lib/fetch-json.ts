/** An error response from this app's API, with its status. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** GETs `url` and parses JSON, throwing `ApiError` with the server's message. */
export const fetchJson = async <T>(url: string, signal?: AbortSignal) => {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
    };

    throw new ApiError(
      response.status,
      body.message ?? `Request failed with ${response.status}`,
    );
  }

  return (await response.json()) as T;
};

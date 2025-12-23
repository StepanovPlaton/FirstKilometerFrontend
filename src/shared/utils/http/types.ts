export type HTTPRequestMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

export type HTTPGetRequestOptions = {
  query?: Record<string, boolean | number | string>;
  headers?: HeadersInit;
  timeout?: number;
  tryTokenUpdate?: boolean;
  overriddenAccessToken?: string;
};

export type HTTPRequestOptions = HTTPGetRequestOptions & {
  body?: BodyInit | object;
  stringify?: boolean;
  timeout?: number;
};

export class HTTPError extends Error {}

export type HTTPResponse = Array<unknown> | Record<string, unknown>;

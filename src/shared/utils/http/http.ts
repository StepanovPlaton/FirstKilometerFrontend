import type { z } from 'zod';

export type HTTPGetRequestOptions = {
  query?: Record<string, string | number | boolean>;
  headers?: HeadersInit;
};

export type HTTPRequestOptions = HTTPGetRequestOptions & {
  body?: BodyInit | object;
  stringify?: boolean;
  timeout?: number;
};

export class HTTPError extends Error {}

export type HTTPResponse = Record<string, unknown> | Array<unknown>;

export abstract class HTTPService {
  private static toStringsRecord(
    input?: Record<string, string | number | boolean>
  ): Record<string, string> {
    const result: Record<string, string> = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        result[key] = String(input[key]);
      }
    }
    return result;
  }

  public static async request<
    Z extends z.ZodType | HTTPResponse = HTTPResponse,
    O = Z extends z.ZodType ? z.infer<Z> : Z,
  >(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    schema?: Z extends z.ZodType ? Z : z.ZodType<Z> | null,
    options?: HTTPRequestOptions
  ): Promise<O> {
    if (!process.env.NEXT_PUBLIC_BASE_URL || !process.env.NEXT_PUBLIC_API_PATTERN) {
      throw new HTTPError('Unknown base api url');
    }
    let requestUrl =
      process.env.NEXT_PUBLIC_BASE_URL + '/' + process.env.NEXT_PUBLIC_API_PATTERN + '/' + url;
    if (!requestUrl.endsWith('/')) {
      requestUrl += '/';
    }
    requestUrl += new URLSearchParams(this.toStringsRecord(options?.query)).toString();
    return fetch(requestUrl, {
      method: method,
      headers: {
        accept: 'application/json',
        ...((options?.stringify ?? true) !== true ? {} : { 'Content-Type': 'application/json' }),
        ...options?.headers,
      },
      body:
        (options?.stringify ?? true) !== true
          ? (options?.body as BodyInit)
          : JSON.stringify(options?.body as object | undefined),
      signal: options?.timeout ? AbortSignal.timeout(options?.timeout) : null,
    })
      .then((r) => {
        if (r && r.ok) {
          return r;
        } else {
          throw new HTTPError('Response ok = false');
        }
      })
      .then((r) => r.json())
      .then((d) => {
        if (schema) {
          const parsed = schema.safeParse(d);
          if (parsed.success) {
            return parsed.data as O;
          } else {
            throw new HTTPError(parsed.error.message);
          }
        } else {
          return d as O;
        }
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
        throw e;
      });
  }

  public static get = <Z extends z.ZodType | HTTPResponse = HTTPResponse>(
    url: string,
    schema?: Z extends z.ZodType ? Z : z.ZodType<Z> | null,
    options?: HTTPGetRequestOptions
  ) => this.request<Z>('GET', url, schema, options);

  public static post = <Z extends z.ZodType | HTTPResponse = HTTPResponse>(
    url: string,
    schema?: Z extends z.ZodType ? Z : z.ZodType<Z> | null,
    options?: HTTPRequestOptions
  ) => this.request('POST', url, schema, options);

  public static put = <Z extends z.ZodType | HTTPResponse = HTTPResponse>(
    url: string,
    schema?: Z extends z.ZodType ? Z : z.ZodType<Z> | null,
    options?: HTTPRequestOptions
  ) => this.request('PUT', url, schema, options);

  public static patch = <Z extends z.ZodType | HTTPResponse = HTTPResponse>(
    url: string,
    schema?: Z extends z.ZodType ? Z : z.ZodType<Z> | null,
    options?: HTTPRequestOptions
  ) => this.request('PATCH', url, schema, options);

  public static delete = <Z extends z.ZodType | HTTPResponse = HTTPResponse>(
    url: string,
    schema?: Z extends z.ZodType ? Z : z.ZodType<Z> | null,
    options?: HTTPGetRequestOptions
  ) => this.request('DELETE', url, schema, options);
}

import type z from 'zod';
import type { HTTPRequestMethod, HTTPRequestOptions, HTTPResponse } from './types';
import { HTTPError } from './types';

export abstract class HTTPUtils {
  private static toStringsRecord(
    input?: Record<string, boolean | number | string>
  ): Record<string, string> {
    const result: Record<string, string> = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        result[key] = String(input[key]);
      }
    }
    return result;
  }
  public static prepareUrl(baseUrl: string, query: HTTPRequestOptions['query']) {
    if (!process.env.NEXT_PUBLIC_BASE_URL || !process.env.NEXT_PUBLIC_API_PATTERN) {
      throw new HTTPError('Unknown base api url');
    }
    let requestUrl =
      process.env.NEXT_PUBLIC_BASE_URL + '/' + process.env.NEXT_PUBLIC_API_PATTERN + '/' + baseUrl;
    if (!requestUrl.endsWith('/')) {
      requestUrl += '/';
    }
    requestUrl += new URLSearchParams(this.toStringsRecord(query)).toString();

    return requestUrl;
  }

  public static createFetch(
    requestUrl: string,
    method: HTTPRequestMethod,
    options?: HTTPRequestOptions,
    accessToken?: string
  ) {
    return fetch(requestUrl, {
      method: method,
      headers: {
        authorization: `Bearer ${options?.overriddenAccessToken ?? accessToken}`,
        accept: 'application/json',
        ...((options?.stringify ?? true) !== true ? {} : { 'Content-Type': 'application/json' }),
        ...options?.headers,
      },
      body:
        (options?.stringify ?? true) !== true
          ? (options?.body as BodyInit)
          : JSON.stringify(options?.body as object | undefined),
      signal: options?.timeout ? AbortSignal.timeout(options?.timeout) : null,
    });
  }

  public static async handleAnswer<
    Z extends HTTPResponse | z.ZodType = HTTPResponse,
    O = Z extends z.ZodType ? z.infer<Z> : Z,
  >(
    r: Response,
    schema?: Z extends z.ZodType ? Z : z.ZodType<Z> | null,
    options?: HTTPRequestOptions,
    tokenRefreshHandler?: () => Promise<O>
  ): Promise<O> {
    if (r && r.ok) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await r.json();
      if (schema) {
        const parsed = schema.safeParse(data);
        if (parsed.success) {
          return parsed.data as O;
        } else {
          throw new HTTPError(parsed.error.message);
        }
      } else {
        return data as O;
      }
    } else if (r.status === 403 && (options?.tryTokenUpdate || !options) && tokenRefreshHandler) {
      return tokenRefreshHandler();
    } else if (r.status === 401) {
      window.location = '/login' as never;
      return undefined as never;
    } else {
      throw new HTTPError('Response ok = false\n JSON body: ' + (await r.text()));
    }
  }
}

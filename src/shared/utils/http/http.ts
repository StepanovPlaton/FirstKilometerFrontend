import type { z } from 'zod';
import { pairOfTokensSchema } from '../schemes/tokens/schema';
import { useAuthTokens } from '../schemes/tokens/store';
import { JWTTools } from '../services/tools';
import type { HTTPGetRequestOptions, HTTPRequestOptions, HTTPResponse } from './types';
import { HTTPError } from './types';
import { HTTPUtils } from './utils';

export abstract class HTTPService {
  private static refreshToken() {
    if (!process.env.NEXT_PUBLIC_API_TOKEN_REFRESH) {
      throw new HTTPError('Unknown token refresh endpoint');
    }
    const authTokens = useAuthTokens.getState();
    if (!authTokens.refresh?.token) {
      throw new HTTPError('Refresh token not found');
    }
    return HTTPService.post(process.env.NEXT_PUBLIC_API_TOKEN_REFRESH, pairOfTokensSchema, {
      body: {
        refresh: authTokens.refresh.token,
      },
      tryTokenUpdate: false,
    }).then((pairOfTokens) => {
      try {
        const pairOfTokensData = new JWTTools().decodeAndValidatePairJWTToken(pairOfTokens);
        authTokens.updateTokens(pairOfTokensData);
      } catch {
        throw new HTTPError('Failed refresh token');
      }
    });
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
    const requestUrl = HTTPUtils.prepareUrl(url, options?.query);
    const authTokens = useAuthTokens.getState();

    return HTTPUtils.createFetch(requestUrl, method, options, authTokens.access?.token)
      .then((r) => {
        return HTTPUtils.handleAnswer(r, schema, options, () =>
          this.refreshToken().then(() =>
            HTTPService.request<Z, O>(method, url, schema, {
              ...options,
              tryTokenUpdate: false,
            })
          )
        );
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

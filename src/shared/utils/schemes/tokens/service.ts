import type z from 'zod';
import HTTPService from '../../http';
import type { RequestOptions } from '../../services/service';
import { SimpleService } from '../../services/service';
import { JWTTools } from '../../services/tools';
import type { PairOfTokens, TokenObtainData } from './schema';
import { pairOfTokensSchema } from './schema';

export class ITokenService extends SimpleService<PairOfTokens> {
  urlPrefix: string;

  constructor(urlPrefix: string, schema: z.ZodType<PairOfTokens>) {
    super(schema);
    this.urlPrefix = urlPrefix;
  }

  obtain = (obtainData: TokenObtainData, options?: RequestOptions): Promise<PairOfTokens> => {
    return HTTPService.post(`${this.urlPrefix}`, this.schema, {
      body: obtainData,
      ...options,
    });
  };
}

export const TokenService = new ITokenService('token', pairOfTokensSchema).addTool(new JWTTools());

import { jwtDecode } from 'jwt-decode';
import z from 'zod';
import type { PairOfTokens, PairOfTokensData } from '../../schemes/tokens/schema';
import {
  accessTokenDataSchema,
  cookieStoredPairOfTokensDataSchema,
  refreshTokenDataSchema,
} from '../../schemes/tokens/schema';
import { EntityTools } from './base';

export class JWTTools extends EntityTools {
  decodeJWTToken = (token: string) => jwtDecode(token);

  decodeAndValidateJWTToken = <T extends z.Schema>(token: string, schema: T) => {
    const tokenData = this.decodeJWTToken(token);
    const validatedTokenData = schema.safeParse(tokenData);
    if (!validatedTokenData.success) {
      throw Error(
        `Token validation failed. \nError: ${z.treeifyError(validatedTokenData.error).errors[0]}`
      );
    } else {
      return validatedTokenData.data;
    }
  };

  decodePairJWTToken = (pairOfTokens: PairOfTokens) => {
    return {
      access: this.decodeJWTToken(pairOfTokens.access),
      refresh: this.decodeJWTToken(pairOfTokens.refresh),
    };
  };

  decodeAndValidatePairJWTToken = (pairOfTokens: PairOfTokens): PairOfTokensData => {
    const accessTokenData = this.decodeAndValidateJWTToken(
      pairOfTokens.access,
      accessTokenDataSchema
    );
    const refreshTokenData = this.decodeAndValidateJWTToken(
      pairOfTokens.refresh,
      refreshTokenDataSchema
    );
    return {
      access: {
        ...accessTokenData,
        token: pairOfTokens.access,
      },
      refresh: {
        ...refreshTokenData,
        token: pairOfTokens.refresh,
      },
    };
  };

  decodeAndValidatePairJWTTokenFromCookies = (cookieData: string): PairOfTokensData => {
    const rawAuthTokens = JSON.parse(cookieData) as unknown;
    const validatedTokenData = cookieStoredPairOfTokensDataSchema.safeParse(rawAuthTokens);
    if (!validatedTokenData.success) {
      throw Error(
        `Cookie stored tokens data validation failed. \nError: ${z.treeifyError(validatedTokenData.error).errors[0]}`
      );
    } else {
      return validatedTokenData.data.state;
    }
  };
}

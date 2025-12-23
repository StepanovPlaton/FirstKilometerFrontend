import { z } from 'zod';

export const pairOfTokensSchema = z.object({
  access: z.jwt(),
  refresh: z.jwt(),
});

export type PairOfTokens = z.output<typeof pairOfTokensSchema>;

export const tokenObtainDataSchema = z.object({
  username: z.string('Логин должен быть непустой строкой'),
  password: z.string('Пароль должен быть непустой строкой'),
  // EXAMPLE: username: z
  //  .string()
  //  .min(4, { message: "Имя пользователя должно содержать 4 или более символов" })
  //  .max(10, { message: "Имя пользователя должно содержать не более 10 символов" })
  //  .regex( /^[ a-zA-Z0-9_]+$/, "Имя пользователя должно содержать только буквы, числа и подчёркивание (_)" ),
});
export type TokenObtainData = z.output<typeof tokenObtainDataSchema>;

export const accessTokenDataSchema = z.object({
  token_type: z.literal('access'),
  role: z.string().min(1),
  user_id: z.coerce.number().positive(),
});
export type AccessTokenData = z.output<typeof accessTokenDataSchema>;

export const refreshTokenDataSchema = z.object({
  token_type: z.literal('refresh'),
  user_id: z.coerce.number().positive(),
});
export type RefreshTokenData = z.output<typeof refreshTokenDataSchema>;

export const pairOfTokensDataSchema = z.object({
  access: accessTokenDataSchema.omit({ token_type: true }).extend({
    token: pairOfTokensSchema.shape.access,
  }),
  refresh: refreshTokenDataSchema.omit({ token_type: true }).extend({
    token: pairOfTokensSchema.shape.refresh,
  }),
});

export type PairOfTokensData = z.output<typeof pairOfTokensDataSchema>;

export const cookieStoredPairOfTokensDataSchema = z.object({
  state: pairOfTokensDataSchema,
  version: z.number(),
});
export type CookieStoredPairOfTokensData = z.output<typeof pairOfTokensDataSchema>;

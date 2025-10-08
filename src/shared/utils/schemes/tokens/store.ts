import { create } from 'zustand';
import CookieStorage from 'zustand-persist-cookie-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Optional } from '../../types';
import type { AccessTokenData, PairOfTokensData } from './schema';

export const nameOfAuthTokensStorePersist = 'auth-tokens';

export type AuthTokensStore = Optional<PairOfTokensData> & {
  updateTokens: (tokens: PairOfTokensData) => void;
  refreshAccessToken: (tokenData: AccessTokenData, token: string) => void;
  clear: () => void;
};

export const useAuthTokens = create<AuthTokensStore>()(
  persist(
    (set) => ({
      access: undefined,
      refresh: undefined,

      updateTokens: (tokens) => set((state) => ({ ...state, ...tokens })),
      refreshAccessToken: (tokenData, token) =>
        set((state) => ({ ...state, access: { ...tokenData, token } })),
      clear: () => {
        set({ access: undefined, refresh: undefined });
      },
    }),
    {
      name: nameOfAuthTokensStorePersist,
      storage: createJSONStorage(() => CookieStorage()),
    }
  )
);

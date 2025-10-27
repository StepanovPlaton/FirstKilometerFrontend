import { create } from 'zustand';
import CookieStorage from 'zustand-persist-cookie-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Optional } from '../../types';
import type { AccessTokenData, PairOfTokensData } from './schema';

export const nameOfAuthTokensStorePersist = 'auth-tokens';

export type AuthTokensStore = Optional<PairOfTokensData> & {
  permissions: string[];
  updateTokens: (tokens: PairOfTokensData) => void;
  updatePermissions: (permissions: string[]) => void;
  refreshAccessToken: (tokenData: AccessTokenData, token: string) => void;
  clear: () => void;
};

export const useAuthTokens = create<AuthTokensStore>()(
  persist(
    (set) => ({
      permissions: [],
      access: undefined,
      refresh: undefined,

      updateTokens: (tokens) => set((state) => ({ ...state, ...tokens })),
      updatePermissions: (permissions) => set((state) => ({ ...state, permissions })),
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

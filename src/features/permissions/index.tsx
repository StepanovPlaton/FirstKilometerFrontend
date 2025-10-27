'use client';

import { TokenService, useAuthTokens } from '@/shared/utils/schemes/tokens';
import { useEffect } from 'react';

export const PermissionsValidator = () => {
  const updatePermissions = useAuthTokens((s) => s.updatePermissions);
  const role = useAuthTokens((s) => s.access?.role);

  useEffect(() => {
    if (role) {
      void (async () => {
        const permissions = await TokenService.getPermissions(role);
        updatePermissions(permissions);
      })();
    }
  }, [role]);

  return <></>;
};

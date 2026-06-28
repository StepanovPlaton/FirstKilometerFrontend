import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import type { PaymentAccount } from '@/entities/payment-account';
import { PaymentAccountService } from '@/entities/payment-account';

import type { HTTPError } from '../http';

export function useCompanyPaymentAccounts(
  companyId: number | null | undefined,
  storeOptions?: SWRConfiguration<PaymentAccount[], HTTPError>
) {
  const isValidCompanyId = companyId !== null && companyId !== undefined;

  const { data, error, isLoading, mutate } = useSWR<PaymentAccount[], HTTPError>(
    isValidCompanyId ? `companies/${companyId}/accounts` : null,
    () => {
      if (!isValidCompanyId) {
        throw new Error('companyId is required to fetch payment accounts');
      }
      return PaymentAccountService.getByCompanyId(companyId);
    },
    storeOptions
  );

  return {
    data,
    loading: isLoading,
    error,
    mutate,
  };
}
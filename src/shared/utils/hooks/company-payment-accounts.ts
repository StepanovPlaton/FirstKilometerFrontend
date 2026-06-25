import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import type { PaymentAccount } from '@/entities/payment-account';
import { PaymentAccountService } from '@/entities/payment-account';

import type { HTTPError } from '../http';

export function useCompanyPaymentAccounts(
  companyId: number | null | undefined,
  storeOptions?: SWRConfiguration<PaymentAccount[], HTTPError>
) {
  const { data, error, isLoading, mutate } = useSWR<PaymentAccount[], HTTPError>(
    companyId != null ? `companies/${companyId}/accounts` : null,
    () => PaymentAccountService.getByCompanyId(companyId!),
    storeOptions
  );

  return {
    data,
    loading: isLoading,
    error,
    mutate,
  };
}

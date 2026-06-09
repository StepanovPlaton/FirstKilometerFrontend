import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import type { HTTPError } from '../http';
import type { Choice, Entity } from '../schemes';
import type { CRUDCService, GetRequestOptions } from '../services';

export function useChoices<E extends Entity>(
  service: CRUDCService<E>,
  requestOptions?: GetRequestOptions,
  storeOptions?: SWRConfiguration<Choice[], HTTPError> & { active?: boolean }
) {
  const queryStr = requestOptions?.query
    ? '?' + new URLSearchParams(
        Object.fromEntries(
          Object.entries(requestOptions.query).map(([k, v]) => [k, String(v)])
        )
      ).toString()
    : '';

  const { data, error, isLoading, mutate } = useSWR<Choice[], HTTPError>(
    (storeOptions?.active ?? true) ? `${service.urlPrefix}/choices${queryStr}` : null,
    () => service.getChoices(requestOptions),
    storeOptions
  );

  return {
    data,
    loading: isLoading,
    error,
    mutate,
  };
}

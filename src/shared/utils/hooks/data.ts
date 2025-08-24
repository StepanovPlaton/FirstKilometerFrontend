import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import type { HTTPError } from '../http';
import type { Entity } from '../schemes';
import type { PageOf } from '../schemes/page';
import type { CRUDService, GetRequestOptions, GetService, PaginatedCRUDService } from '../services';

export function useEntity<E extends Entity>(
  service: GetService<E>,
  identifier: E['uuid'] | null,
  requestOptions?: GetRequestOptions,
  storeOptions?: SWRConfiguration<E, HTTPError> & { active?: boolean }
) {
  const { data, error, isLoading, mutate } = useSWR<E, HTTPError>(
    (storeOptions?.active ?? true) ? `${service.urlPrefix}/${identifier}` : null,
    () =>
      identifier === null
        ? service.getDummy(identifier, requestOptions)
        : service.get(identifier, requestOptions),
    storeOptions
  );

  return {
    data,
    loading: isLoading,
    error,
    mutate,
  };
}

export function useEntities<E extends Entity>(
  service: CRUDService<E>,
  dummy: boolean = false,
  requestOptions?: GetRequestOptions,
  storeOptions?: SWRConfiguration<E[], HTTPError> & { active?: boolean }
) {
  const { data, error, isLoading, mutate } = useSWR<E[], HTTPError>(
    (storeOptions?.active ?? true) ? `${service.urlPrefix}/` : null,
    () => (dummy ? service.getDummies(requestOptions) : service.getAll(requestOptions)),
    storeOptions
  );

  return {
    data,
    loading: isLoading,
    error,
    mutate,
  };
}

export function usePage<E extends Entity>(
  service: PaginatedCRUDService<E>,
  page: number | null,
  requestOptions?: GetRequestOptions & { pageSize?: number },
  storeOptions?: SWRConfiguration<PageOf<E>, HTTPError> & { active?: boolean }
) {
  const { data, error, isLoading, mutate } = useSWR<PageOf<E>, HTTPError>(
    (storeOptions?.active ?? true) ? [`${service.urlPrefix}`, page] : null,
    () =>
      page === null
        ? service.getDummyPage(page, requestOptions?.pageSize, requestOptions)
        : service.getPage(page, requestOptions?.pageSize, requestOptions),
    storeOptions
  );

  return {
    data,
    loading: isLoading,
    error,
    mutate,
  };
}

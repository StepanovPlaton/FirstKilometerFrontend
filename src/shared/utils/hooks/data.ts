import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import type { HTTPError } from '../http';
import type { Entity } from '../schemes';
import type { Identifier } from '../schemes/entity';
import type { CRUDService, GetRequestOptions, GetService } from '../services';

export function useEntity<E extends Entity>(
  service: GetService<E>,
  identifier: Identifier<E> | null,
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

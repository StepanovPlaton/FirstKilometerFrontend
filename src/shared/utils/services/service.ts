import { z } from 'zod';

import type { HTTPGetRequestOptions, HTTPRequestOptions } from '../http';
import HTTPService from '../http';
import type { Choice, Entity } from '../schemes';
import { choiceSchema, createMockData, isTypeOfSchema, softArrayOf } from '../schemes';
import type { PageOf } from '../schemes/page';
import { schemaPageOf, schemaStrictPageOf } from '../schemes/page';
import { ExtendableClass } from './extend';
import type { EntityTools } from './tools';

export type RequestOptions = Omit<HTTPRequestOptions, 'body'>;
export type GetRequestOptions = HTTPGetRequestOptions;

export abstract class EmptyService extends ExtendableClass<EntityTools> {}

export abstract class GetService<E extends Entity> extends EmptyService {
  schema: z.ZodType<E>;
  urlPrefix: string;

  constructor(urlPrefix: string, schema: z.ZodType<E>) {
    super();
    this.schema = schema;
    this.urlPrefix = urlPrefix;
  }

  getDummy = (
    _: Entity['uuid'] | null = 'c7264e75-7be0-4cdb-adb3-495c3e215088',
    __: GetRequestOptions = {},
    delay: number = 100
  ): Promise<E> => {
    // return await new Promise<E>((r) => setTimeout(() => r({} as E), delay));
    return new Promise<E>((resolve) =>
      setTimeout(() => resolve(createMockData(this.schema)), delay)
    );
  };

  get = (identifier: Entity['uuid'], options?: GetRequestOptions): Promise<E> => {
    return HTTPService.get(`${this.urlPrefix}/${identifier}`, this.schema, options);
  };
}

export abstract class CRUDService<E extends Entity> extends GetService<E> {
  getAll = (options?: GetRequestOptions): Promise<E[]> => {
    return HTTPService.get(`${this.urlPrefix}/`, softArrayOf(this.schema), options);
  };
  getDummies = (_: GetRequestOptions = {}, delay: number = 100): Promise<E[]> => {
    // return await new Promise<E>((r) => setTimeout(() => r({} as E), delay));
    return new Promise<E[]>((resolve) =>
      setTimeout(() => resolve(createMockData(z.array(this.schema))), delay)
    );
  };

  post = (entity: Omit<E, 'uuid'>, options?: RequestOptions): Promise<E> => {
    return HTTPService.post(`${this.urlPrefix}/`, this.schema, {
      body: entity,
      ...options,
    });
  };
  postPartial = (entity: Partial<E>, options?: RequestOptions): Promise<E> => {
    return HTTPService.post(`${this.urlPrefix}/`, this.schema, {
      body: entity,
      ...options,
    });
  };
  postAny = (
    entity: Required<HTTPRequestOptions>['body'],
    options?: RequestOptions
  ): Promise<E> => {
    return HTTPService.post(`${this.urlPrefix}/`, this.schema, {
      body: entity,
      ...options,
    });
  };

  put = (entity: E, options?: RequestOptions): Promise<E> => {
    return HTTPService.put(`${this.urlPrefix}/${entity.uuid}/`, this.schema, {
      body: entity,
      ...options,
    });
  };
  putAny = (entity: object & Pick<E, 'uuid'>, options?: RequestOptions): Promise<E> => {
    return HTTPService.put(`${this.urlPrefix}/${entity.uuid}/`, this.schema, {
      body: entity,
      ...options,
    });
  };

  patch = (entity: Partial<E> & Pick<E, 'uuid'>, options?: RequestOptions): Promise<E> => {
    return HTTPService.patch(`${this.urlPrefix}/${entity.uuid}/`, this.schema, {
      body: entity,
      ...options,
    });
  };
  patchPartial = (entity: Partial<E> & Pick<E, 'uuid'>, options?: RequestOptions): Promise<E> => {
    return HTTPService.patch(`${this.urlPrefix}/${entity.uuid}/`, this.schema, {
      body: entity,
      ...options,
    });
  };

  delete = (what: E | E['uuid'], options?: GetRequestOptions): Promise<E> => {
    return ((identifier) =>
      HTTPService.delete(`${this.urlPrefix}/${identifier}`, this.schema, options))(
      isTypeOfSchema(what, this.schema) ? what.uuid : what
    );
  };
}

export abstract class CRUDCService<E extends Entity> extends CRUDService<E> {
  getChoices = (options?: GetRequestOptions): Promise<Choice[]> => {
    return HTTPService.get(`${this.urlPrefix}/choices/`, softArrayOf(choiceSchema), options);
  };
}

export abstract class PaginatedCRUDService<E extends Entity> extends CRUDService<E> {
  getDummyPage = (
    _: number | null = 0,
    __: number = 10,
    ___: GetRequestOptions = {},
    delay: number = 100
  ): Promise<PageOf<E>> => {
    return new Promise<PageOf<E>>((resolve) =>
      setTimeout(() => resolve(createMockData(schemaStrictPageOf(this.schema))), delay)
    );
  };

  getPage = (
    page: number = 0,
    pageSize: number = 10,
    options?: GetRequestOptions
  ): Promise<PageOf<E>> => {
    return HTTPService.get(
      `${this.urlPrefix}/?page=${page}&page_size=${pageSize}`,
      schemaPageOf(this.schema),
      { ...options, query: { ...options?.query, page, pageSize } }
    );
  };
}

export type Service<E extends Entity> = GetService<E> | CRUDService<E> | PaginatedCRUDService<E>;

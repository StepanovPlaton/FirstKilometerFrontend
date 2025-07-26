import type { z } from 'zod';

import type { HTTPGetRequestOptions, HTTPRequestOptions } from '../http';
import HTTPService from '../http';
import type { Entity } from '../schemes';
import { createMockData, isTypeOfSchema, softArrayOf } from '../schemes';
import type { PageOf } from '../schemes/page';
import { schemaPageOf, schemaStrictPageOf } from '../schemes/page';
import { ExtendableClass } from './extend';
import type { EntityTools } from './tools';

export type RequestOptions = Omit<HTTPRequestOptions, 'body'>;
export type GetRequestOptions = HTTPGetRequestOptions;

export abstract class GetService<E extends Entity> extends ExtendableClass<EntityTools> {
  urlPrefix: string;
  schema: z.Schema<E>;

  constructor(urlPrefix: string, schema: z.Schema<E>) {
    super();
    this.urlPrefix = urlPrefix;
    this.schema = schema;
  }

  getDummy = (
    _: Entity['id'] | null = 0,
    __: GetRequestOptions = {},
    delay: number = 100
  ): Promise<E> => {
    // return await new Promise<E>((r) => setTimeout(() => r({} as E), delay));
    return new Promise<E>((resolve) =>
      setTimeout(() => resolve(createMockData(this.schema)), delay)
    );
  };

  get = (identifier: Entity['id'], options?: GetRequestOptions): Promise<E> => {
    return HTTPService.get(`${this.urlPrefix}/${identifier}`, this.schema, options);
  };
}

export abstract class CRUDService<E extends Entity> extends GetService<E> {
  getAll = (options?: GetRequestOptions): Promise<E[]> => {
    return HTTPService.get(`${this.urlPrefix}/all/`, softArrayOf(this.schema), options);
  };

  post = (entity: Omit<Entity, 'id'>, options?: RequestOptions): Promise<E> => {
    return HTTPService.post(`${this.urlPrefix}/`, this.schema, {
      body: entity,
      ...options,
    });
  };
  postPartial = (entity: Partial<Entity>, options?: RequestOptions): Promise<E> => {
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

  put = (entity: Entity, options?: RequestOptions): Promise<E> => {
    return HTTPService.put(`${this.urlPrefix}/${entity.id}/`, this.schema, {
      body: entity,
      ...options,
    });
  };
  putAny = (entity: object & Pick<Entity, 'id'>, options?: RequestOptions): Promise<E> => {
    return HTTPService.put(`${this.urlPrefix}/${entity.id}/`, this.schema, {
      body: entity,
      ...options,
    });
  };

  patch = (entity: Partial<Entity> & Pick<Entity, 'id'>, options?: RequestOptions): Promise<E> => {
    return HTTPService.patch(`${this.urlPrefix}/${entity.id}/`, this.schema, {
      body: entity,
      ...options,
    });
  };
  patchPartial = (
    entity: Partial<Entity> & Pick<Entity, 'id'>,
    options?: RequestOptions
  ): Promise<E> => {
    return HTTPService.patch(`${this.urlPrefix}/${entity.id}/`, this.schema, {
      body: entity,
      ...options,
    });
  };

  delete = (what: Entity | Entity['id'], options?: GetRequestOptions): Promise<E> => {
    return ((identifier) =>
      HTTPService.delete(`${this.urlPrefix}/${identifier}`, this.schema, options))(
      isTypeOfSchema(what, this.schema) ? what.id : (what as Entity['id'])
    );
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

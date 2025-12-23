import { z } from 'zod';

import type { HTTPGetRequestOptions, HTTPRequestOptions } from '../http';
import HTTPService from '../http';
import type { Choice, Entity } from '../schemes';
import { choiceSchema, createMockData, isTypeOfSchema, softArrayOf } from '../schemes';
import type { Identifier, WithIdentifier } from '../schemes/entity';
import { getIdentifier } from '../schemes/entity';
import type { WithoutIdentifier } from '../schemes/entity/schema';
import type { PageOf } from '../schemes/page';
import { schemaPageOf, schemaStrictPageOf } from '../schemes/page';
import { ExtendableClass } from './extend';
import type { EntityTools } from './tools/base';

export type RequestOptions = Omit<HTTPRequestOptions, 'body'>;
export type GetRequestOptions = HTTPGetRequestOptions;

export abstract class EmptyService extends ExtendableClass<EntityTools> {}

const removeIdFields = <T extends object>(entity: T): Omit<T, 'id' | 'uuid'> => {
  if ('id' in entity) {
    const { id: _, ...rest } = entity;
    return rest as Omit<T, 'id' | 'uuid'>;
  } else if ('uuid' in entity) {
    const { uuid: _, ...rest } = entity;
    return rest as Omit<T, 'id' | 'uuid'>;
  } else {
    return entity;
  }
};

export abstract class SimpleService<E> extends EmptyService {
  schema: z.ZodType<E>;
  constructor(schema: z.ZodType<E>) {
    super();
    this.schema = schema;
  }
}

export abstract class GetService<E extends Entity> extends SimpleService<E> {
  urlPrefix: string;

  constructor(urlPrefix: string, schema: z.ZodType<E>) {
    super(schema);
    this.urlPrefix = urlPrefix;
  }

  getDummy = (
    _: Identifier<E> | null,
    __: GetRequestOptions = {},
    delay: number = 100
  ): Promise<E> => {
    // return await new Promise<E>((r) => setTimeout(() => r({} as E), delay));
    return new Promise<E>((resolve) =>
      setTimeout(() => resolve(createMockData(this.schema)), delay)
    );
  };

  get = (identifier: Identifier<E>, options?: GetRequestOptions): Promise<E> => {
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

  post = (entity: WithoutIdentifier<E>, options?: RequestOptions): Promise<E> => {
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
    return HTTPService.put(`${this.urlPrefix}/${getIdentifier(entity)}/`, this.schema, {
      body: removeIdFields(entity),
      ...options,
    });
  };
  putAny = (entity: object & WithIdentifier<E>, options?: RequestOptions): Promise<E> => {
    return HTTPService.put(`${this.urlPrefix}/${getIdentifier(entity)}/`, this.schema, {
      body: removeIdFields(entity),
      ...options,
    });
  };

  patch = (entity: Partial<E> & WithIdentifier<E>, options?: RequestOptions): Promise<E> => {
    return HTTPService.patch(`${this.urlPrefix}/${getIdentifier(entity)}/`, this.schema, {
      body: removeIdFields(entity),
      ...options,
    });
  };
  patchPartial = (entity: Partial<E> & WithIdentifier<E>, options?: RequestOptions): Promise<E> => {
    return HTTPService.patch(`${this.urlPrefix}/${getIdentifier(entity)}/`, this.schema, {
      body: removeIdFields(entity),
      ...options,
    });
  };

  delete = (what: E | Identifier<E>, options?: GetRequestOptions): Promise<E> => {
    return ((identifier: string | number) =>
      HTTPService.delete(`${this.urlPrefix}/${identifier}`, this.schema, options))(
      isTypeOfSchema(what, this.schema) ? getIdentifier(what) : (what as string | number)
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

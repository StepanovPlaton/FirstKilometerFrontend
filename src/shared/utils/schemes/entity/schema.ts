import dayjs from 'dayjs';
import { z } from 'zod';

const date = z
  .string()
  .optional()
  .nullable()
  .transform((d) => (d ? dayjs(d) : null));

export const entitySchema = z.object({
  // id: z.number().positive().optional(),
  uuid: z.uuid(),
  created_at: date,
  updated_at: date,
});

export type UUIDEntity = z.infer<typeof entitySchema>;

export const idEntitySchema = z.object({
  id: z.number().positive(),
  created_at: date,
  updated_at: date,
});

export type IDEntity = z.infer<typeof idEntitySchema>;

export const isEntity = (a: unknown): a is UUIDEntity => {
  return entitySchema.safeParse(a).success;
};
export const isIDEntity = (a: unknown): a is IDEntity => {
  return entitySchema.safeParse(a).success;
};

export type Entity = UUIDEntity | IDEntity;

export type WithIdentifier<E extends Entity> = E extends UUIDEntity
  ? { uuid: E['uuid'] }
  : E extends IDEntity
    ? { id: E['id'] }
    : never;

export type Identifier<E extends Entity> = E extends UUIDEntity
  ? E['uuid']
  : E extends IDEntity
    ? E['id']
    : never;
export type WithoutIdentifier<E extends Entity> = Omit<E, 'uuid' | 'id'>;

export const getIdentifier = <E extends Entity>(entity: WithIdentifier<E>) => {
  if ('uuid' in entity) {
    return entity.uuid;
  } else if ('id' in entity) {
    return entity.id;
  } else {
    throw Error('Unexpected entity. Cannot find identifier in ' + JSON.stringify(entity));
  }
};

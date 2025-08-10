import { z } from 'zod';

import { entitySchema } from '@/shared/utils/schemes';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const toDayjsDate = (d?: string | null) => (d ? dayjs(d) : null);

export const rawVehicleSchema = entitySchema.extend({
  pts_id: z.string({ error: 'Номер ПТС должен быть строкой' }),
  sts_id: z.string({ error: 'Номер СТС должен быть строкой' }),
  reg_number: z.string({ error: 'Регистрационный номер должен быть строкой' }),
  vin: z.string({ error: 'VIN-номер должен быть строкой' }),
  make_model: z.string({ error: 'Марка и модель ТС должны быть строкой' }),
  type: z.string({ error: 'Тип ТС должен быть строкой' }),
  year: z.number({ error: 'Год выпуска ТС должен быть числом' }),
  color: z.string({ error: 'Цвет ТС должен быть строкой' }),
  chassis: z.string({ error: 'Номер шасси ТС должен быть строкой' }),
  body: z.string({ error: 'Номер кузова ТС должен быть строкой' }),
  engine: z.string({ error: 'Номер двигателя ТС должен быть строкой' }),
  pts_date: z.iso.date({ error: 'Некорректная дата выдачи ПТС' }),
  sts_date: z.iso.date({ error: 'Некорректная дата выдачи СТС' }).nullable(),
});
export type Vehicle = z.TypeOf<typeof rawVehicleSchema>;

export const apiVehicleSchema = entitySchema.extend({
  pts_id: rawVehicleSchema.shape.pts_id.nullable(),
  sts_id: rawVehicleSchema.shape.sts_id.nullable(),
  reg_number: rawVehicleSchema.shape.reg_number.nullable(),
  vin: rawVehicleSchema.shape.vin.nullable(),
  make_model: rawVehicleSchema.shape.make_model.nullable(),
  type: rawVehicleSchema.shape.type.nullable(),
  year: rawVehicleSchema.shape.year.nullable(),
  color: rawVehicleSchema.shape.color.nullable(),
  chassis: rawVehicleSchema.shape.chassis.nullable(),
  body: rawVehicleSchema.shape.body.nullable(),
  engine: rawVehicleSchema.shape.engine.nullable(),

  pts_date: rawVehicleSchema.shape.pts_date.nullable().transform(toDayjsDate),
  sts_date: rawVehicleSchema.shape.sts_date.transform(toDayjsDate),

  sts_front_url: z.url(),
  sts_back_url: z.url(),
  pts_url: z.url(),
});
export type ApiVehicle = z.TypeOf<typeof apiVehicleSchema>;

export const formVehicleSchema = entitySchema.extend({
  //Добавить маску на номера
  pts_id: rawVehicleSchema.shape.pts_id
    .min(3, { error: 'Слишком короткий номер ПТС' })
    .max(20, { error: 'Слишком длинный номер ПТС' }),
  sts_id: rawVehicleSchema.shape.sts_id
    .min(3, { error: 'Слишком короткий номер СТС' })
    .max(20, { error: 'Слишком длинный номер СТС' })
    .or(z.literal(''))
    .nullable(),
  reg_number: rawVehicleSchema.shape.reg_number
    .min(3, { error: 'Слишком короткий регистрационный номер' })
    .max(12, { error: 'Слишком длинный регистрационный номер' })
    .or(z.literal(''))
    .nullable(),
  vin: rawVehicleSchema.shape.vin
    .min(3, { error: 'Слишком короткий VIN-номер' })
    .max(19, { error: 'Слишком длинный VIN-номер' }),
  make_model: rawVehicleSchema.shape.make_model
    .min(3, { error: 'Слишком короткая марка и модель' })
    .max(100, { error: 'Слишком длинная марка и модель' }),
  type: rawVehicleSchema.shape.type
    .min(3, { error: 'Слишком короткий тип ТС' })
    .max(50, { error: 'Слишком длинный тип ТС' }),
  year: rawVehicleSchema.shape.year
    .positive({ error: 'Год не может быть отрицательный' })
    .min(1900, { error: 'Слишком маленький год выпуска ТС' })
    .max(2100, { error: 'Слишком большой год выпуска ТС' }),
  color: rawVehicleSchema.shape.color
    .min(3, { error: 'Слишком короткий цвет ТС' })
    .max(50, { error: 'Слишком длинный цвет ТС' }),
  chassis: rawVehicleSchema.shape.chassis
    .min(3, { error: 'Слишком короткий номер шасси ТС' })
    .max(50, { error: 'Слишком длинный номер шасси ТС' }),
  body: rawVehicleSchema.shape.body
    .min(3, { error: 'Слишком короткий номер кузова ТС' })
    .max(19, { error: 'Слишком длинный номер кузова ТС' }),
  engine: rawVehicleSchema.shape.engine
    .min(3, { error: 'Слишком короткий номер двигателя ТС' })
    .max(20, { error: 'Слишком длинный номер двигателя ТС' }),

  pts_date: z
    .any()
    .refine((o) => dayjs.isDayjs(o))
    .transform((d) => (d as never as Dayjs)?.format('YYYY-MM-DD')),
  sts_date: z
    .any()
    .nullable()
    .refine((o) => (o ? dayjs.isDayjs(o) : true))
    .transform((d) => (d ? (d as never as Dayjs).format('YYYY-MM-DD') : null)),
});
export type FormVehicle = z.TypeOf<typeof formVehicleSchema>;

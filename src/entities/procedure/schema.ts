import { idEntitySchema } from '@/shared/utils/schemes/entity/schema';
import { z } from 'zod';

export const procedureSchema = idEntitySchema.extend({
  name: z.string().min(1, { message: 'Укажите наименование' }).max(255),
  price: z.coerce.number().nonnegative({ message: 'Стоимость не может быть отрицательной' }),
  measure: z.string().max(4, { message: 'Не более 4 символов' }).default('шт'),
});

export type Procedure = z.output<typeof procedureSchema>;

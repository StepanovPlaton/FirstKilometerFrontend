import { idEntitySchema } from '@/shared/utils/schemes/entity';
import z from 'zod';

export const articleCategorySchema = idEntitySchema.extend({
  name: z
    .string({ error: 'Название категории артикулов должно быть строкой' })
    .min(1, { error: 'Название категории артикулов не может быть пустым' })
    .max(50, { error: 'Слишком длинное название категории артикулов' }),
  category: z
    .string({ error: 'Категория артикулов должна быть строкой' })
    .min(1, { error: 'Категория артикулов не может быть пустой' })
    .max(8, { error: 'Слишком длинная категория артикулов' }),
});
export type ArticleCategory = z.output<typeof articleCategorySchema>;

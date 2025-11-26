import { CRUDCService } from '@/shared/utils/services';
import type { ArticleCategory } from './schema';
import { articleCategorySchema } from './schema';

export class IArticleCategoryService extends CRUDCService<ArticleCategory> {}

export const ArticleCategoryService = new IArticleCategoryService(
  'vehicles/article_categories',
  articleCategorySchema
);

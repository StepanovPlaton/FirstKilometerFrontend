import { articleCategorySchema, type ArticleCategory } from '@/entities/vehicle/article';
import { Title } from '@/shared/ui/title';
import { getValidationRules } from '@/shared/utils/schemes/validator';
import type { FormInstance } from 'antd';
import { Form, Input, Skeleton } from 'antd';

export const VerifyArticleCategory = ({
  ...props
}: {
  articleCategory: ArticleCategory | undefined;
  form: FormInstance<ArticleCategory>;
}) => {
  return (
    <Form<ArticleCategory> layout="vertical" form={props.form}>
      <Title level={2}>Категория артикулов</Title>
      {props.articleCategory ? (
        <>
          <Form.Item<ArticleCategory>
            label="Категория"
            name={'category'}
            rules={getValidationRules(articleCategorySchema, 'category')}
          >
            <Input />
          </Form.Item>
          <Form.Item<ArticleCategory>
            label="Название категории"
            name={'name'}
            rules={getValidationRules(articleCategorySchema, 'name')}
          >
            <Input />
          </Form.Item>
        </>
      ) : (
        <Skeleton active className="mt-10" />
      )}
    </Form>
  );
};

'use client';

import type { ArticleCategory } from '@/entities/vehicle/article';
import ArticleCategoryService, { articleCategorySchema } from '@/entities/vehicle/article';
import { addTextSortAndFilters } from '@/features/tables/sort-filters';
import { VerifyArticleCategory } from '@/features/verify/article-category';
import { useEntities } from '@/shared/utils/hooks/data';
import { useAuthTokens } from '@/shared/utils/schemes/tokens';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, message, Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Подключаем русскую локаль dayjs
import { useEffect, useState } from 'react';
import z from 'zod';
dayjs.locale('ru');

export default function ArticlesTablesPage() {
  const permissions = useAuthTokens((s) => s.permissions);

  const {
    data: articleCategories,
    loading,
    mutate: mutateTable,
  } = useEntities(ArticleCategoryService);

  const [articleCategory, setArticleCategory] = useState<ArticleCategory>();
  const [messageApi, contextHolder] = message.useMessage();
  const [articleCategoryForm] = Form.useForm<ArticleCategory>();

  useEffect(() => {
    articleCategoryForm.setFieldsValue(articleCategory as never as ArticleCategory);
  }, [articleCategory, articleCategoryForm]);

  const submitArticleCategory = (values: ArticleCategory) => {
    const validatedForm = articleCategorySchema.omit({ id: true }).safeParse({
      ...values,
      id: articleCategory?.id,
    });
    if (validatedForm.success) {
      return (
        articleCategory?.id
          ? ArticleCategoryService.putAny({ id: articleCategory.id, ...validatedForm.data })
          : ArticleCategoryService.post(validatedForm.data)
      )
        .then((articleCategory) =>
          mutateTable((articleCategories) =>
            articleCategories?.map((u) => (u.id === articleCategory.id ? articleCategory : u))
          )
        )
        .catch((e) => {
          messageApi.error('Не удалось сохранить категорию артикулов. Повторите попытку позже');
          throw e;
        });
    } else {
      messageApi.error('Данные категории артикулов заполнены неверно');
      const errorMessage = z.treeifyError(validatedForm.error).errors[0];
      if (errorMessage) {
        messageApi.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage));
    }
  };

  const columns: ColumnsType<ArticleCategory> = [
    {
      key: 'category',
      title: 'Категория',
      dataIndex: 'category',
      ...addTextSortAndFilters<ArticleCategory, 'category'>('category', articleCategories),
    },
    {
      key: 'name',
      title: 'Название категории',
      dataIndex: 'name',
      ...addTextSortAndFilters<ArticleCategory, 'name'>('name', articleCategories),
    },
  ];

  return (
    <Flex vertical align="end" className="w-full" gap={8}>
      <Table<ArticleCategory>
        className="w-full"
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={articleCategories ?? ([] as ArticleCategory[])}
        pagination={false}
        onRow={(record) => {
          return {
            onClick: () => setArticleCategory(record),
          };
        }}
        scroll={{
          x: 'max-content',
        }}
      />
      {permissions.includes('add_individual') && (
        <Button onClick={() => setArticleCategory({} as ArticleCategory)}>
          <PlusOutlined />
          Добавить
        </Button>
      )}
      <Modal
        open={!!articleCategory}
        width={500}
        okText={'Проверить и сохранить'}
        okButtonProps={{
          disabled: !permissions.includes('change_individual'),
        }}
        onOk={() => {
          void articleCategoryForm
            .validateFields()
            .catch((e) => {
              messageApi.warning(
                'Исправьте ошибки в форме категории артикулов и повторите попытку'
              );
              throw e;
            })
            .then(() => submitArticleCategory(articleCategoryForm.getFieldsValue()))
            .then(() => {
              messageApi.success('Данные успешно сохранены');
              setArticleCategory(undefined);
            });
        }}
        onCancel={() => {
          setArticleCategory(undefined);
          articleCategoryForm.resetFields();
        }}
      >
        <VerifyArticleCategory articleCategory={articleCategory} form={articleCategoryForm} />
      </Modal>
      {contextHolder}
    </Flex>
  );
}

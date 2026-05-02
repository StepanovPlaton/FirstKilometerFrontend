'use client';

import type { PaymentAccount } from '@/entities/payment-account';
import { PaymentAccountService } from '@/entities/payment-account';
import { addCreatedAndUpdated, addTextSortAndFilters } from '@/features/tables/sort-filters';
import {
  type PaymentAccountFormModel,
  VerifyPaymentAccount,
} from '@/features/verify/payment-account';
import { useEntities } from '@/shared/utils/hooks/data';
import { paymentAccountCoreSchema } from '@/shared/utils/schemes/payment-account';
import { useAuthTokens } from '@/shared/utils/schemes/tokens';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, message, Modal, Popconfirm, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { useEffect, useState } from 'react';
import { mutate as mutateSWR } from 'swr';
import z from 'zod';
dayjs.locale('ru');

function accountToFormModel(a: PaymentAccount): PaymentAccountFormModel {
  return {
    id: a.id,
    bank_account: a.bank_account,
    bank_name: a.bank_name,
    bik: a.bik,
    corr_account: a.corr_account,
  };
}

function parseApiErrorMessage(err: unknown): string | undefined {
  if (!(err instanceof Error)) {
    return undefined;
  }
  const marker = 'JSON body:';
  const idx = err.message.indexOf(marker);
  if (idx === -1) {
    return undefined;
  }
  const raw = err.message.slice(idx + marker.length).trim();
  try {
    const parsed = JSON.parse(raw) as { error?: string };
    return typeof parsed.error === 'string' ? parsed.error : undefined;
  } catch {
    return undefined;
  }
}

export default function PaymentAccountsTablesPage() {
  const permissions = useAuthTokens((s) => s.permissions);

  const canView =
    permissions.includes('view_internalcompany') ||
    permissions.includes('view_externalcompany');
  const canAdd =
    permissions.includes('add_internalcompany') ||
    permissions.includes('add_externalcompany');
  const canChange =
    permissions.includes('change_internalcompany') ||
    permissions.includes('change_externalcompany');
  const canDelete =
    permissions.includes('delete_internalcompany') ||
    permissions.includes('delete_externalcompany');

  const { data: accounts, loading, mutate: mutateTable } = useEntities(PaymentAccountService);

  const [account, setAccount] = useState<PaymentAccount | Record<string, never>>();
  const [messageApi, contextHolder] = message.useMessage();
  const [accountForm] = Form.useForm<PaymentAccountFormModel>();

  useEffect(() => {
    if (account === undefined) {
      return;
    }
    const a = account as PaymentAccount;
    if ('id' in a && typeof a.id === 'number') {
      accountForm.setFieldsValue(accountToFormModel(a));
    } else {
      accountForm.setFieldsValue({
        bank_account: '',
        bank_name: '',
        bik: '',
        corr_account: '',
      });
    }
  }, [account, accountForm]);

  const submitPaymentAccount = (values: PaymentAccountFormModel) => {
    const validated = paymentAccountCoreSchema.safeParse(values);
    if (!validated.success) {
      messageApi.error('Проверьте реквизиты счёта');
      const errorMessage = z.treeifyError(validated.error).errors[0];
      if (errorMessage) {
        messageApi.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage ?? 'Ошибка валидации'));
    }

    const current = account;
    const id = current && 'id' in current && typeof current.id === 'number' ? current.id : undefined;

    return (
      id
        ? PaymentAccountService.putAny({ id, ...validated.data })
        : PaymentAccountService.post(validated.data as never)
    )
      .then((saved) =>
        mutateTable((list) =>
          id ? list?.map((x) => (x.id === saved.id ? saved : x)) : [...(list ?? []), saved]
        )
      )
      .catch(() => {
        messageApi.error('Не удалось сохранить счёт. Повторите попытку позже');
        return Promise.reject(new Error('save_failed'));
      });
  };

  const columns: ColumnsType<PaymentAccount> = [
    {
      key: 'bank_account',
      title: 'Расчётный счёт',
      dataIndex: 'bank_account',
      ...addTextSortAndFilters<PaymentAccount, 'bank_account'>('bank_account', accounts),
    },
    {
      key: 'bik',
      title: 'БИК',
      dataIndex: 'bik',
      ...addTextSortAndFilters<PaymentAccount, 'bik'>('bik', accounts),
    },
    {
      key: 'bank_name',
      title: 'Банк',
      dataIndex: 'bank_name',
      ...addTextSortAndFilters<PaymentAccount, 'bank_name'>('bank_name', accounts),
    },
    {
      key: 'corr_account',
      title: 'Корр. счёт',
      dataIndex: 'corr_account',
      ...addTextSortAndFilters<PaymentAccount, 'corr_account'>('corr_account', accounts),
    },
    ...addCreatedAndUpdated<PaymentAccount>(),
    ...(canDelete
      ? [
          {
            key: 'delete',
            dataIndex: 'id',
            render: (id: number) => (
              <Popconfirm
                title="Удаление счёта"
                description="Удалить расчётный счёт из справочника?"
                okText="Удалить"
                cancelText="Отмена"
                okButtonProps={{ danger: true }}
                onConfirm={(e) => {
                  e?.stopPropagation();
                  void PaymentAccountService.delete(id)
                    .then(() => {
                      void mutateSWR('companies/payment-accounts');
                      void mutateTable((list) => list?.filter((x) => x.id !== id));
                    })
                    .catch((err: unknown) => {
                      const msg = parseApiErrorMessage(err);
                      messageApi.error(msg ?? 'Не удалось удалить счёт');
                    });
                }}
                onCancel={(e) => e?.stopPropagation()}
              >
                <Button
                  danger
                  onClick={(ev) => {
                    ev.stopPropagation();
                  }}
                >
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  if (!canView) {
    return null;
  }

  return (
    <Flex vertical align="end" className="w-full" gap={8}>
      {canAdd && (
        <Button type="primary" onClick={() => setAccount({} as PaymentAccount)}>
          <PlusOutlined />
          Добавить
        </Button>
      )}
      <Table<PaymentAccount>
        className="w-full"
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={accounts ?? ([] as PaymentAccount[])}
        pagination={false}
        onRow={(record) => {
          return {
            onClick: () => setAccount(record),
          };
        }}
        scroll={{
          x: 'max-content',
        }}
      />
      <Modal
        open={!!account}
        width={520}
        okText="Проверить и сохранить"
        okButtonProps={{
          disabled: !canChange,
        }}
        onOk={() => {
          void accountForm
            .validateFields()
            .then(() => submitPaymentAccount(accountForm.getFieldsValue()))
            .then(() => {
              void mutateSWR('companies/payment-accounts');
              messageApi.success('Данные успешно сохранены');
              setAccount(undefined);
            })
            .catch((e: unknown) => {
              if (e && typeof e === 'object' && 'errorFields' in e) {
                messageApi.warning('Исправьте ошибки в форме и повторите попытку');
              }
            });
        }}
        onCancel={() => {
          setAccount(undefined);
          accountForm.resetFields();
        }}
      >
        <VerifyPaymentAccount account={account} form={accountForm} />
      </Modal>
      {contextHolder}
    </Flex>
  );
}

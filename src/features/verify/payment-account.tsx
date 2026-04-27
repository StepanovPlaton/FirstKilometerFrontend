import type { PaymentAccount } from '@/entities/payment-account';
import { Title } from '@/shared/ui/title';
import {
  paymentAccountCoreSchema,
  type PaymentAccountCore,
} from '@/shared/utils/schemes/payment-account';
import { getValidationRules } from '@/shared/utils/schemes/validator';
import type { FormInstance } from 'antd';
import { Form, Input, Skeleton } from 'antd';

export type PaymentAccountFormModel = PaymentAccountCore & {
  id?: number;
};

export const VerifyPaymentAccount = ({
  ...props
}: {
  account: PaymentAccount | Record<string, never> | undefined;
  form: FormInstance<PaymentAccountFormModel>;
}) => {
  const schema = paymentAccountCoreSchema;

  return (
    <Form<PaymentAccountFormModel> layout="vertical" form={props.form}>
      <Title level={2}>Расчётный счёт</Title>
      {props.account !== undefined ? (
        <>
          <Form.Item<PaymentAccountFormModel>
            label="Расчётный счёт"
            name={'bank_account'}
            rules={getValidationRules(schema, 'bank_account')}
          >
            <Input className="w-full!" maxLength={20} />
          </Form.Item>
          <Form.Item<PaymentAccountFormModel>
            label="БИК"
            name={'bik'}
            rules={getValidationRules(schema, 'bik')}
          >
            <Input className="w-full!" maxLength={9} />
          </Form.Item>
          <Form.Item<PaymentAccountFormModel>
            label="Наименование банка"
            name={'bank_name'}
            rules={getValidationRules(schema, 'bank_name')}
          >
            <Input />
          </Form.Item>
          <Form.Item<PaymentAccountFormModel>
            label="Корреспондентский счёт"
            name={'corr_account'}
            rules={getValidationRules(schema, 'corr_account')}
          >
            <Input className="w-full!" maxLength={20} />
          </Form.Item>
        </>
      ) : (
        <Skeleton active className="mt-10" />
      )}
    </Form>
  );
};

import { CRUDService } from '@/shared/utils/services';

import type { PaymentAccount } from './schema';
import { paymentAccountSchema } from './schema';

class PaymentAccountServiceClass extends CRUDService<PaymentAccount> {}

export const PaymentAccountService = new PaymentAccountServiceClass(
  'companies/payment-accounts',
  paymentAccountSchema
);

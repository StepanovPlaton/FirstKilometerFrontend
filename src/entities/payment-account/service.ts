import HTTPService from '@/shared/utils/http';
import { softArrayOf } from '@/shared/utils/schemes/softArray';
import { CRUDService } from '@/shared/utils/services';

import type { PaymentAccount } from './schema';
import { paymentAccountSchema } from './schema';

class PaymentAccountServiceClass extends CRUDService<PaymentAccount> {
  getByCompanyId(companyId: number) {
    return HTTPService.get(`companies/${companyId}/accounts/`, softArrayOf(paymentAccountSchema));
  }
}

export const PaymentAccountService = new PaymentAccountServiceClass(
  'companies/payment-accounts',
  paymentAccountSchema
);

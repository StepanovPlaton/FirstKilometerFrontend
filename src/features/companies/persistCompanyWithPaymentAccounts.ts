import ExternalCompanyService from '@/entities/external-company';
import InternalCompanyService from '@/entities/internal-company';
import {
  companyFormValuesSchema,
  normalizeCompanyFieldsForApi,
  type CompanyApi,
  type CompanyFormValues,
} from '@/shared/utils/schemes/company';

export type PersistCompanyParams = {
  mode: 'internal' | 'external';
  companyId?: number | undefined;
  values: CompanyFormValues;
};

export async function persistCompanyWithPaymentAccounts(
  params: PersistCompanyParams
): Promise<CompanyApi> {
  const { mode, companyId, values } = params;

  const parsedForm = companyFormValuesSchema.safeParse(values);
  if (!parsedForm.success) {
    throw parsedForm.error;
  }
  const v = parsedForm.data;

  const companyService = mode === 'internal' ? InternalCompanyService : ExternalCompanyService;

  const corePayload = normalizeCompanyFieldsForApi(v, mode);
  const writeBody = {
    ...corePayload,
    payment_account_ids: v.payment_account_ids ?? [],
  };

  if (companyId) {
    return companyService.putAny({
      id: companyId,
      ...writeBody,
    } as never);
  }
  return companyService.post(writeBody as never);
}

export function formatPaymentAccountsForTable(company: CompanyApi, separator = ' | '): string {
  const list = company.payment_accounts ?? [];
  if (list.length === 0) {
    return '—';
  }
  return list.map((a) => `${a.bank_name}: ${a.bank_account}`).join(separator);
}

export function companyToFormValues(
  co: Partial<CompanyApi> | Record<string, never>,
  defaultCompanyType: 'internal' | 'external'
): CompanyFormValues {
  const c = co as Partial<CompanyApi>;
  return {
    id: c.id,
    created_at: c.created_at,
    updated_at: c.updated_at,
    name: c.name ?? '',
    short_name: c.short_name ?? null,
    inn: c.inn ?? '',
    kpp: c.kpp ?? null,
    ogrn: c.ogrn ?? '',
    legal_address: c.legal_address ?? '',
    postal_address: c.postal_address ?? null,
    phone: c.phone ?? null,
    email: c.email ?? null,
    director_name: c.director_name ?? null,
    director_position: c.director_position ?? 'Генеральный директор',
    company_type: c.company_type ?? defaultCompanyType,
    payment_account_ids: c.payment_accounts?.map((a) => a.id) ?? [],
  };
}

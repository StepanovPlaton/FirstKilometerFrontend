'use client';

import type { ExternalCompany } from '@/entities/external-company';
import ExternalCompanyService from '@/entities/external-company';
import type { ApiIndividual, Individual } from '@/entities/individual';
import IndividualService from '@/entities/individual';
import type { InternalCompany } from '@/entities/internal-company';
import InternalCompanyService from '@/entities/internal-company';
import type { ApiVehicle } from '@/entities/vehicle';
import VehicleService from '@/entities/vehicle';
import { UploadDocument } from '@/features/upload';
import { Text } from '@/shared/ui/text';
import { Title } from '@/shared/ui/title';
import { useChoices } from '@/shared/utils/hooks/choices';
import { Button, Card, Checkbox, Flex, message, Select, Space, Spin } from 'antd';
import type { RcFile } from 'antd/lib/upload';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [buyer, setBuyer] = useState<'individual' | 'internal_company' | 'external_company'>(
    'individual'
  );

  const [loadingUser, setLoadingUser] = useState(false);
  const [passportMainPage, setPassportMainPage] = useState<RcFile>();
  const [passportRegistration, setPassportRegistration] = useState<RcFile>();
  const [user, setUser] = useState<ApiIndividual>();
  const {
    data: existsUsers,
    loading: loadingExistsUsers,
    error: failedGetExistsUsers,
  } = useChoices(IndividualService);
  const [selectedUser, setSelectedUser] = useState<Individual['uuid']>();
  const [createEmptyUser, setCreateEmptyUser] = useState(false);
  useEffect(() => {
    if (createEmptyUser) {
      setSelectedUser(undefined);
      setPassportMainPage(undefined);
      setPassportRegistration(undefined);
    }
  }, [createEmptyUser]);

  const {
    data: internalCompanies,
    error: getInternalCompaniesError,
    loading: loadingInternalCompanies,
  } = useChoices(InternalCompanyService);
  const [internalCompany, setInternalCompany] = useState<InternalCompany['id']>();

  const {
    data: externalCompanies,
    error: getExternalCompaniesError,
    loading: loadingExternalCompanies,
  } = useChoices(ExternalCompanyService);
  const [externalCompany, setExternalCompany] = useState<ExternalCompany['id']>();

  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [vehiclePassport, setVehiclePassport] = useState<RcFile>();
  const [vehicleRegistrationFront, setVehicleRegistrationFront] = useState<RcFile>();
  const [vehicleRegistrationBack, setVehicleRegistrationBack] = useState<RcFile>();
  const [vehicle, setVehicle] = useState<ApiVehicle>();
  const {
    data: existsVehicles,
    loading: loadingExistsVehicles,
    error: failedGetExistsVehicles,
  } = useChoices(VehicleService);
  const [selectedVehicle, setSelectedVehicle] = useState<number>();

  const [messageApi, contextHolder] = message.useMessage();

  const [validated, setValidated] = useState(false);

  const submit = () => {
    const requests: Promise<unknown>[] = [];
    if (!selectedUser && !user && buyer === 'individual') {
      if (!passportMainPage && !createEmptyUser) {
        messageApi.error('Чтобы продолжить, загрузите главную страницу паспорта клиента');
        return;
      }
      if (!passportRegistration && !createEmptyUser) {
        messageApi.error('Чтобы продолжить, загрузите страницу с пропиской из паспорта клиента');
        return;
      }
      requests.push(
        (async () => {
          setLoadingUser(true);
          const userData = new FormData();
          if (!createEmptyUser && passportMainPage && passportRegistration) {
            userData.append('passport_main', passportMainPage);
            userData.append('passport_registration', passportRegistration);
          }
          return await IndividualService.postAny(userData, { stringify: false })
            .then((user) => setUser(user))
            .catch(() =>
              messageApi.error('Не удалось загрузить данные клиента. Повторите попытку позже')
            )
            .finally(() => setLoadingUser(false));
        })()
      );
    }
    if (!selectedVehicle && !vehicle) {
      if (!vehiclePassport) {
        messageApi.error('Чтобы продолжить, загрузите паспорт транспортного средства (ПТС)');
        return;
      }
      requests.push(
        (async () => {
          setLoadingVehicle(true);
          const vehicleData = new FormData();
          vehicleData.append('pts_main', vehiclePassport);
          if (vehicleRegistrationFront) {
            vehicleData.append('sts_front', vehicleRegistrationFront);
          }
          if (vehicleRegistrationBack) {
            vehicleData.append('sts_back', vehicleRegistrationBack);
          }
          return await VehicleService.postAny(vehicleData, { stringify: false })
            .then((vehicle) => setVehicle(vehicle))
            .catch(() =>
              messageApi.error(
                'Не удалось загрузить данные транспортного средства. Повторите попытку позже'
              )
            )
            .finally(() => setLoadingVehicle(false));
        })()
      );
    }
    void Promise.all(requests).then(() => setValidated(true));
  };

  useEffect(() => {
    const userUUID = selectedUser ?? user?.uuid;
    const vehicleUUID = selectedVehicle ?? vehicle?.uuid;

    if (
      validated &&
      ((buyer === 'individual' && userUUID) ||
        (buyer === 'internal_company' && internalCompany) ||
        (buyer === 'external_company' && externalCompany)) &&
      vehicleUUID
    ) {
      let url =
        `/verify?vehicle=${vehicleUUID}&buyer=${buyer}` +
        `&buyer_id=${buyer === 'individual' ? userUUID : buyer === 'internal_company' ? internalCompany : externalCompany}`;
      [
        'type',
        'seller',
        'seller_id',
        'price',
        'date',
        'tax',
        'options',
        'additional_services',
        'additional_services_cost',
      ].forEach((key) => {
        const value = searchParams.get(key);
        if (value) {
          url += `&${key}=${value}`;
        }
      });
      router.push(url);
    }
  }, [selectedUser, user, selectedVehicle, vehicle, searchParams, validated, router]);

  return (
    <Space direction="vertical" align="center" size="large" className="flex w-full">
      <Card className="w-100">
        <Flex justify="center">
          <Title level={2}>Покупатель</Title>
        </Flex>
        <Spin spinning={loadingUser}>
          <Space direction="vertical" size="large" align="center" style={{ display: 'flex' }}>
            <Select
              className="w-86"
              placeholder="Выберите покупателя"
              options={[
                {
                  label: 'Клиент',
                  value: 'individual',
                },
                {
                  label: 'Филиал',
                  value: 'internal_company',
                  disabled: searchParams.get('seller') === 'internal_company',
                },
                {
                  label: 'Юридическое лицо',
                  value: 'external_company',
                },
              ]}
              onChange={(v: typeof buyer) => setBuyer(v)}
              defaultValue={buyer}
            />
            {buyer === 'individual' ? (
              <Space direction="vertical" align="center">
                <Text>Добавьте нового клиента</Text>
                <Space className="w-full">
                  <UploadDocument
                    file={passportMainPage}
                    onUpload={setPassportMainPage}
                    text="Загрузите паспорт (главная страница)"
                    disabled={!!user || !!selectedUser || !!createEmptyUser}
                  />
                  <UploadDocument
                    file={passportRegistration}
                    onUpload={setPassportRegistration}
                    text="Загрузите паспорт (прописка)"
                    disabled={!!user || !!selectedUser || !!createEmptyUser}
                  />
                </Space>
                <Text>или</Text>
                <Select
                  className="w-86"
                  placeholder="Выберите существующего клиента"
                  disabled={
                    !!passportMainPage ||
                    !!passportRegistration ||
                    !!failedGetExistsUsers ||
                    !!user ||
                    !!createEmptyUser
                  }
                  loading={loadingExistsUsers}
                  options={existsUsers ?? []}
                  onChange={setSelectedUser}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                />
                <Text>или</Text>
                <Button
                  onClick={() => setCreateEmptyUser((s) => !s)}
                  disabled={!!user || !!selectedUser}
                >
                  <Checkbox checked={createEmptyUser}>Создать клиента без документов</Checkbox>
                </Button>
              </Space>
            ) : buyer === 'internal_company' ? (
              <Select
                className="w-86!"
                placeholder="Выберите филиал"
                disabled={!!getInternalCompaniesError}
                loading={loadingInternalCompanies}
                options={internalCompanies ?? []}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onChange={(id: InternalCompany['id']) => setInternalCompany(id)}
              />
            ) : (
              <Select
                className="w-86!"
                placeholder="Выберите юридическое лицо"
                disabled={!!getExternalCompaniesError}
                loading={loadingExternalCompanies}
                options={externalCompanies ?? []}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onChange={(id: ExternalCompany['id']) => setExternalCompany(id)}
              />
            )}
          </Space>
        </Spin>
      </Card>
      <Card className="w-142">
        <Flex justify="center">
          <Title level={2}>Автомобиль</Title>
        </Flex>
        <Spin spinning={loadingVehicle}>
          <Space direction="vertical" align="center" className="w-full">
            <Text>Добавьте новый автомобиль</Text>
            <Space className="w-full">
              <UploadDocument
                file={vehiclePassport}
                onUpload={setVehiclePassport}
                text="Загрузите паспорт транспортного средства (ПТС/ЭПТС)"
                disabled={!!vehicle || !!selectedVehicle}
              />
              <UploadDocument
                file={vehicleRegistrationFront}
                onUpload={setVehicleRegistrationFront}
                text="Загрузите лицевую сторону свидетельства о регистрации (СТС/VIN)"
                disabled={!!vehicle || !!selectedVehicle}
              />
              <UploadDocument
                file={vehicleRegistrationBack}
                onUpload={setVehicleRegistrationBack}
                text="Загрузите обратную сторону свидетельства о регистрации (СТС/ФИО)"
                disabled={!!vehicle || !!selectedVehicle}
              />
            </Space>
            <Text>или</Text>
            <Select
              className="w-80"
              placeholder="Выберите существующий автомобиль"
              disabled={
                !!vehiclePassport ||
                !!vehicleRegistrationFront ||
                !!vehicleRegistrationBack ||
                !!failedGetExistsVehicles ||
                !!vehicle
              }
              loading={loadingExistsVehicles}
              options={existsVehicles ?? []}
              onChange={setSelectedVehicle}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            />
          </Space>
        </Spin>
      </Card>
      <Button type="primary" size="large" onClick={() => void submit()}>
        Проверить данные
      </Button>
      {contextHolder}
    </Space>
  );
}

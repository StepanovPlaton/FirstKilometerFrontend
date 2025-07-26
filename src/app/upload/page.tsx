'use client';

import type { User } from '@/entities/user';
import UserService from '@/entities/user';
import { UploadDocument } from '@/features/upload';
import { Text } from '@/shared/ui/text';
import { Title } from '@/shared/ui/title';
import { Button, Card, message, Select, Space, Spin } from 'antd';
import type { RcFile } from 'antd/lib/upload';
import { useState } from 'react';

export default function UploadPage() {
  const [loadingUser, setLoadingUser] = useState(false);
  const [passportMainPage, setPassportMainPage] = useState<RcFile>();
  const [passportRegistration, setPassportRegistration] = useState<RcFile>();
  const [_, setUser] = useState<User>();

  const [loadingVehicle /*, setLoadingVehicle*/] = useState(false);
  const [vehiclePassport, setVehiclePassport] = useState<RcFile>();
  const [vehicleRegistration, setVehicleRegistration] = useState<RcFile>();
  // const [vehicle, setVehicle] = useState();

  const [selectedUser /*, setSelectedUser*/] = useState<User['id']>();
  // const [selectedVehicle, setSelectedVehicle] = useState<number>();

  const [messageApi, contextHolder] = message.useMessage();

  const submit = async () => {
    const requests: Promise<unknown>[] = [];
    if (!selectedUser) {
      if (!passportMainPage) {
        messageApi.error('Чтобы продолжить, загрузите главную страницу паспорта клиента');
        return;
      }
      if (!passportRegistration) {
        messageApi.error('Чтобы продолжить, загрузите страницу с пропиской из паспорта клиента');
        return;
      }
      requests.push(
        (() => {
          setLoadingUser(true);
          const userData = new FormData();
          userData.append('passport_main', passportMainPage);
          userData.append('passport_registration', passportRegistration);
          return UserService.postAny(userData, { stringify: false })
            .then((user) => setUser(user))
            .catch(() =>
              messageApi.error('Не удалось загрузить данные клиента. Повторите попытку позже')
            )
            .finally(() => setLoadingUser(false));
        })()
      );
    }
    // if (!selectedVehicle) {
    //   if (!vehiclePassport) {
    //     messageApi.error('Чтобы продолжить, загрузите паспорт транспортного средства (ПТС)');
    //     return;
    //   }
    //   if (!passportRegistration) {
    //     messageApi.error('Чтобы продолжить, загрузите свидетельство о регистрации (СТС)');
    //     return;
    //   }
    //   requests.push(() => {
    //     setLoadingVehicle(true);
    //     return new Promise((r) => r(null));
    //   });
    // }
    await Promise.all(requests);
  };

  return (
    <Space direction="vertical" align="center" size="large">
      <Space size="large">
        <Card className="w-100">
          <Space direction="vertical" align="center" className="w-full">
            <Title level={2}>Клиент</Title>
            <Spin spinning={loadingUser}>
              <Text>Добавьте нового клиента</Text>
              <Space className="w-full">
                <UploadDocument
                  onUpload={setPassportMainPage}
                  text="Загрузите паспорт (главная страница)"
                />
                <UploadDocument
                  onUpload={setPassportRegistration}
                  text="Загрузите паспорт (прописка)"
                />
              </Space>
              <Text>или</Text>
              <Select
                className="w-80"
                placeholder="Выберите существующего клиента"
                disabled={!!passportMainPage || !!passportRegistration}
              ></Select>
            </Spin>
          </Space>
        </Card>
        <Card className="w-100">
          <Title level={2}>Автомобиль</Title>
          <Spin spinning={loadingVehicle}>
            <Space direction="vertical" align="center" className="w-full">
              <Text>Добавьте новый автомобиль</Text>
              <Space className="w-full">
                <UploadDocument
                  onUpload={setVehiclePassport}
                  text="Загрузите паспорт транспортного средства (ПТС)"
                />
                <UploadDocument
                  onUpload={setVehicleRegistration}
                  text="Загрузите свидетельство о регистрации (СТС)"
                />
              </Space>
              <Text>или</Text>
              <Select
                className="w-80"
                placeholder="Выберите существующий автомобиль"
                disabled={!!vehiclePassport || !!vehicleRegistration}
              ></Select>
            </Space>
          </Spin>
        </Card>
      </Space>
      <Button type="primary" size="large" onClick={() => void submit()}>
        Проверить данные
      </Button>
      {contextHolder}
    </Space>
  );
}

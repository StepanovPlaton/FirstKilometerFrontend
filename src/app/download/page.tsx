'use client';

import CompanyService from '@/entities/company';
import DocumentService from '@/entities/documents';
import UserService from '@/entities/user';
import VehicleService from '@/entities/vehicle';
import { Title } from '@/shared/ui/title';
import { useChoices } from '@/shared/utils/hooks/choices';
import type { HTTPError } from '@/shared/utils/http';
import type { Choice } from '@/shared/utils/schemes';
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Spin,
} from 'antd';
import { redirect, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const requiredRule = [{ required: true, message: 'Это обязательное поле' }];

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const {
    data: documentTypes,
    error: getDocumentTypesError,
    isLoading: loadingDocumentTypes,
  } = useSWR<Choice[], HTTPError>(`documents/choices`, () => DocumentService.getTypes());

  const {
    data: companies,
    error: getCompaniesError,
    isLoading: loadingCompanies,
  } = useSWR<Choice[], HTTPError>(`companies/choices`, () => CompanyService.getChoices());

  const {
    data: existsVehicles,
    loading: loadingExistsVehicles,
    error: failedGetExistsVehicles,
  } = useChoices(VehicleService);

  const {
    data: existsUsers,
    loading: loadingExistsUsers,
    error: failedGetExistsUsers,
  } = useChoices(UserService);

  const searchParams = useSearchParams();
  const userUUID = searchParams.get('user');
  const vehicleUUID = searchParams.get('vehicle');

  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm();

  useEffect(() => {
    if (userUUID && existsUsers && existsUsers.find((u) => u.value === userUUID)) {
      form.setFieldValue('user', userUUID);
    }
  }, [existsUsers, userUUID, form]);
  useEffect(() => {
    if (vehicleUUID && existsVehicles && existsVehicles.find((v) => v.value === vehicleUUID)) {
      form.setFieldValue('vehicle', vehicleUUID);
    }
  }, [existsVehicles, vehicleUUID, form]);

  const getDocument = (data: object) => {
    setLoading(true);
    void DocumentService.getDocument(data)
      .then((doc) => {
        const link = document.createElement('a');
        link.download = doc.document_name;
        link.href = doc.document_url;
        link.click();
      })
      .catch(() => messageApi.error('Не удалось сформировать договор. Попробуйте позже'))
      .finally(() => setLoading(false));
  };

  return (
    <Space direction="vertical" align="center" size="large">
      <Card className="w-110">
        <Form layout="vertical" form={form} onFinish={getDocument}>
          <Flex vertical align="center" gap={12}>
            <Flex justify="center">
              <Title level={2}>Скачать готовый договор</Title>
            </Flex>
            <Spin spinning={loading}>
              <Form.Item label="Тип договора" name={'type'} rules={requiredRule}>
                <Select
                  className="w-80!"
                  placeholder="Выберите тип договора"
                  disabled={!!getDocumentTypesError}
                  loading={loadingDocumentTypes}
                  options={documentTypes ?? []}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item label="Клиент" name={'user'} rules={requiredRule}>
                <Select
                  className="w-80!"
                  placeholder="Выберите клиента"
                  disabled={!!failedGetExistsUsers}
                  loading={loadingExistsUsers}
                  options={existsUsers ?? []}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item label="Транспортное средство" name={'vehicle'} rules={requiredRule}>
                <Select
                  className="w-80!"
                  placeholder="Выберите транспортное средство"
                  disabled={!!failedGetExistsVehicles}
                  loading={loadingExistsVehicles}
                  options={existsVehicles ?? []}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item label="Компания" name={'company'} rules={requiredRule}>
                <Select
                  className="w-80!"
                  placeholder="Выберите компанию"
                  disabled={!!getCompaniesError}
                  loading={loadingCompanies}
                  options={companies ?? []}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Row className="w-80!">
                <Col span={12}>
                  <Form.Item label="Цена" name={'price'} rules={requiredRule}>
                    <InputNumber
                      className="w-38!"
                      addonAfter="₽"
                      min={0}
                      placeholder="Введите цену"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Комиссия" name={'tax'} rules={requiredRule}>
                    <InputNumber
                      className="w-40!"
                      addonAfter="%"
                      min={0}
                      max={100}
                      placeholder="Введите комиссию"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Spin>
          </Flex>
        </Form>
      </Card>
      <Space>
        <Button type="primary" size="large" onClick={() => form.submit()}>
          Скачать договор
        </Button>
        <Button size="large" onClick={() => redirect('/upload')}>
          Добавить нового пользователя
        </Button>
      </Space>
      {contextHolder}
    </Space>
  );
}

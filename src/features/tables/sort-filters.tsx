import { CalendarOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'antd/lib/table/interface';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export const addTextSortAndFilters = <T extends { [k in K]: string | null }, K extends keyof T>(
  key: keyof T,
  rows?: T[]
) => {
  return {
    sorter: (a: T, b: T) => a[key]?.localeCompare(b[key] ?? '') ?? 0,
    filters:
      rows
        ?.reduce(
          (filters, row) =>
            row[key] && !filters.includes(row[key]) ? [...filters, row[key]] : filters,
          [] as string[]
        )
        .sort()
        .map((value) => ({ text: value, value: value })) ?? [],
    onFilter: (value: string, row: T) => row[key] === value,
    filterMode: 'tree',
    filterSearch: true,
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => {
          const filterInput = document.querySelector(
            '.ant-table-filter-dropdown input'
          ) as HTMLInputElement;
          if (filterInput) {
            filterInput.addEventListener('input', (e) => {
              const searchValue = (e.target as HTMLInputElement).value.toLowerCase();
              const filterItems = document.querySelectorAll('.ant-tree-treenode');
              filterItems.forEach((item) => {
                const text = item.textContent?.toLowerCase() || '';
                if (text.includes(searchValue)) {
                  (item as HTMLElement).style.display = '';
                } else {
                  (item as HTMLElement).style.display = 'none';
                }
              });
            });
          }
        }, 100);
      }
    },
  } as ColumnsType<T>[number];
};
export const addDateSortAndFilters = <T extends Record<K, Dayjs | null>, K extends keyof T>(
  key: K
) => {
  return {
    sorter: (a: T, b: T) => {
      const aDate = a[key];
      const bDate = b[key];

      if (aDate && bDate) {
        return aDate.diff(bDate);
      }
      if (aDate) {
        return 1;
      }
      if (bDate) {
        return -1;
      }
      return 0;
    },
    filterIcon: (filtered: boolean) => (
      <CalendarOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, close, clearFilters }) => {
      const handleChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
          setSelectedKeys([dates] as unknown as Key[]);
          confirm();
          close();
        } else {
          clearFilters?.({ confirm: true, closeDropdown: true });
        }
      };

      return (
        <div style={{ padding: 8 }}>
          <RangePicker
            format="DD.MM.YYYY"
            value={(selectedKeys[0] ?? null) as [Dayjs, Dayjs] | null}
            onChange={handleChange}
            onOk={handleChange}
          />
        </div>
      );
    },
    onFilter: (value: unknown, row: T) => {
      const dates = value as [Dayjs, Dayjs] | null;

      if (!dates || !dates[0] || !dates[1]) {
        return true;
      }

      const rowDate = row[key];
      if (!rowDate) {
        return false;
      }

      const startDate = dates[0].startOf('day');
      const endDate = dates[1].endOf('day');

      return rowDate.isAfter(startDate) && rowDate.isBefore(endDate);
    },
  } as ColumnsType<T>[number];
};

export const addCreatedAndUpdated = <
  T extends Record<string, unknown> & { created_at: Dayjs | null; updated_at: Dayjs | null },
>(): ColumnsType<T> => {
  return [
    {
      key: 'updated',
      title: 'Обновлён',
      dataIndex: 'updated_at',
      render: (updated_at: Dayjs) => updated_at?.format('DD MMMM') ?? '???',
      ...addDateSortAndFilters<T, 'updated_at'>('updated_at'),
    },
    {
      key: 'created',
      title: ' Создан',
      dataIndex: 'created_at',
      render: (created_at: Dayjs) => created_at?.format('DD MMMM YYYY г.') ?? '???',
      ...addDateSortAndFilters<T, 'created_at'>('created_at'),
    },
  ] as ColumnsType<T>;
};

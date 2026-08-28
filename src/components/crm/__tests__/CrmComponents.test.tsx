import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomerList } from '../CustomerList';
import { CreateCustomerModal } from '../CreateCustomerModal';
import { CustomerModal } from '../CustomerModal';
import { ToastProvider } from '../../../context/ToastContext';
import * as api from '../../../services/api';

vi.mock('../../../services/api', () => ({
  createCustomer: vi.fn(),
  addCustomerInteraction: vi.fn(),
}));

describe('CRM Components', () => {
  const mockCustomers = [
    {
      id: 'c-1',
      name: 'سارا احمدی',
      email: 'sara@example.com',
      phone: '09120000000',
      total_lifetime_value: 5000000,
      interactions_count: 2,
      transactions_count: 3,
      created_at: '2026-01-01',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders CustomerList and filters by search term', () => {
    const onSelect = vi.fn();
    const onAdd = vi.fn();

    render(
      <CustomerList
        customers={mockCustomers as any}
        onSelectCustomer={onSelect}
        onAddCustomerClick={onAdd}
      />
    );

    expect(screen.getByText(/لیست مشتریان و ارزش طول عمر/i)).toBeInTheDocument();
    expect(screen.getAllByText('سارا احمدی').length).toBeGreaterThan(0);

    const addBtn = screen.getByText('مشتری جدید');
    fireEvent.click(addBtn);
    expect(onAdd).toHaveBeenCalled();
  });

  it('CustomerList in read-only mode disables the create button', () => {
    const onSelect = vi.fn();
    const onAdd = vi.fn();

    render(
      <CustomerList
        customers={mockCustomers as any}
        onSelectCustomer={onSelect}
        onAddCustomerClick={onAdd}
        readOnly
      />
    );

    expect(screen.getByText('ایجاد مشتری غیرفعال')).toBeInTheDocument();
    const addBtn = screen.getByText('ایجاد مشتری غیرفعال').closest('button');
    expect(addBtn).toBeDisabled();
    fireEvent.click(addBtn!);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('renders CreateCustomerModal and handles submission', async () => {
    (api.createCustomer as any).mockResolvedValue({ id: 'c-2', name: 'رضا' });
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <ToastProvider>
        <CreateCustomerModal
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </ToastProvider>
    );

    expect(screen.getByText(/ثبت مشتری جدید/i)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('مثلاً: سارا احمدی');
    fireEvent.change(nameInput, {
      target: { value: 'رضا رضایی' },
    });
    const emailInput = screen.getByPlaceholderText('name@example.com');
    fireEvent.change(emailInput, {
      target: { value: 'reza@example.com' },
    });

    const form = nameInput.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(api.createCustomer).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'رضا رضایی', email: 'reza@example.com' })
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('renders CustomerModal with interaction list and submits new interaction', async () => {
    (api.addCustomerInteraction as any).mockResolvedValue({ success: true });
    const onClose = vi.fn();
    const onRefresh = vi.fn();

    render(
      <ToastProvider>
        <CustomerModal
          customer={{
            ...mockCustomers[0],
            interactions: [
              { id: 'i-1', customer_id: 'c-1', interaction_type: 'NOTE', content: 'یادداشت تستی', timestamp: '2026-03-21T10:00:00Z' },
            ],
          } as any}
          onClose={onClose}
          onRefresh={onRefresh}
        />
      </ToastProvider>
    );

    expect(screen.getByText('ثبت یادداشت یا گزارش تماس')).toBeInTheDocument();
    expect(screen.getByText('یادداشت تستی')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('متن یادداشت یا خلاصه پیگیری را وارد کنید...');
    fireEvent.change(input, { target: { value: 'گزارش جلسه تلفنی' } });

    const form = input.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(api.addCustomerInteraction).toHaveBeenCalledWith('c-1', 'NOTE', 'گزارش جلسه تلفنی');
      expect(onRefresh).toHaveBeenCalled();
    });
  });
});

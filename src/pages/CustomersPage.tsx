import React, { useEffect, useState } from 'react';
import { CustomerList } from '../components/crm/CustomerList';
import { CustomerModal } from '../components/crm/CustomerModal';
import { CreateCustomerModal } from '../components/crm/CreateCustomerModal';
import { fetchCustomers, fetchCustomerDetail } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Customer } from '../types';
import { SEO } from '../components/common/SEO';

export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const readOnly = Boolean(user?.is_read_only);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSelectCustomer = async (cust: Customer) => {
    try {
      const fullDetail = await fetchCustomerDetail(cust.id);
      setSelectedCustomer(fullDetail);
    } catch (err) {
      setSelectedCustomer(cust);
    }
  };

  return (
    <div className="space-y-6">
      <SEO
        title="مدیریت مشتریان (CRM) | شاپیک"
        description="لیست مشتریان، ارزش حیاتی خریداران (LTV)، سابقه تعاملات و ایجاد مشتری جدید."
        canonicalPath="/dashboard/customers"
      />

      {/* Single H1 requirement */}
      <h1 className="sr-only">مدیریت مشتریان (CRM) شاپیک</h1>

      <CustomerList
        customers={customers}
        onSelectCustomer={handleSelectCustomer}
        onAddCustomerClick={() => setIsCreateModalOpen(true)}
        readOnly={readOnly}
      />

      {/* Customer Profile Modal */}
      <CustomerModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onRefresh={() => selectedCustomer && handleSelectCustomer(selectedCustomer)}
        readOnly={readOnly}
      />

      {/* Create Customer Modal */}
      <CreateCustomerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadCustomers}
      />
    </div>
  );
};

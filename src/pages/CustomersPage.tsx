import React, { useEffect, useState } from 'react';
import { CustomerList } from '../components/crm/CustomerList';
import { CustomerModal } from '../components/crm/CustomerModal';
import { fetchCustomers, fetchCustomerDetail } from '../services/api';
import { Customer } from '../types';
import { usePageContext } from '../context/PageContext';

export const CustomersPage: React.FC = () => {
  const { setPageMetricsSnapshot } = usePageContext();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data);
      setPageMetricsSnapshot({ total_customers_count: data.length });
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
      <CustomerList
        customers={customers}
        onSelectCustomer={handleSelectCustomer}
        onAddCustomerClick={() => {}}
      />

      {/* Customer Profile & Timeline Modal */}
      <CustomerModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onRefresh={() => selectedCustomer && handleSelectCustomer(selectedCustomer)}
      />
    </div>
  );
};

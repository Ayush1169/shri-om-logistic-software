"use client";

import { use, useEffect, useState } from "react";
import CustomerForm from "@/components/customer/CustomerForm";
import { getCustomerById } from "@/services/customer.service";
import { Customer } from "@/types/customer";

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, []);

  const loadCustomer = async () => {
    try {
      const response = await getCustomerById(Number(id));
      setCustomer(response.customer);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        Loading Customer...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        Customer Not Found
      </div>
    );
  }

  return (
    <CustomerForm
      initialData={customer}
      isEdit={true}
    />
  );
}
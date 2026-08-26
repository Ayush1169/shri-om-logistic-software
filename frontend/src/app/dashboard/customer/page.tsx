"use client";

import { useEffect, useState } from "react";
import {
  getCustomers,
  toggleCustomerStatus,
} from "@/services/customer.service";
import { Customer } from "@/types/customer";
import CustomerToolbar from "@/components/customer/CustomerToolbar";
import CustomerTable from "@/components/customer/CustomerTable";


export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  

  async function loadCustomers() {
    try {
      setLoading(true);

      const response = await getCustomers();

      setCustomers(response.customers);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const handleStatus = async (id: number) => {
  try {
    await toggleCustomerStatus(id);

    alert("Customer status updated");

    loadCustomers(); // list refresh
  } catch (error) {
    console.log(error);
    alert("Failed to update status");
  }
};

  if (loading) {
    return (
      <div className="p-6">
        Loading Customers...
      </div>
    );
  }

  return (
    <div className="p-6">
  <h1 className="mb-6 text-3xl font-bold">
    Customers
  </h1>

  <CustomerToolbar />

  <CustomerTable
  customers={customers}
  onStatus={handleStatus}
/>
</div>
  );
}
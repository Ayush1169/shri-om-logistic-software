"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { getCustomerById } from "@/services/customer.service";

export default function CustomerDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    loadCustomer();
  }, []);

  async function loadCustomer() {
    const data = await getCustomerById(Number(id));
    setCustomer(data.customer);
  }

  if (!customer) return <p>Loading...</p>;

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h1 className="mb-6 text-2xl font-bold">
        Customer Details
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <p><b>Code:</b> {customer.customerCode}</p>
        <p><b>Name:</b> {customer.customerName}</p>
        <p><b>Mobile:</b> {customer.mobile}</p>
        <p><b>Email:</b> {customer.email}</p>
        <p><b>City:</b> {customer.city}</p>
        <p><b>State:</b> {customer.state}</p>
        <p><b>GST:</b> {customer.gstNumber}</p>
        <p><b>PAN:</b> {customer.panNumber}</p>
        <p><b>Credit:</b> ₹{customer.creditLimit}</p>
        <p><b>Payment:</b> {customer.paymentTerms} Days</p>
      </div>
    </div>
  );
}
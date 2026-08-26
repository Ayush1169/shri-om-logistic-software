"use client";

import { useState } from "react";
import {
  createCustomer,
  updateCustomer,
} from "@/services/customer.service";

import { Customer } from "@/types/customer";
import { useRouter } from "next/navigation";

 type Props = {
  initialData?: Customer;
  isEdit?: boolean;
};

export default function CustomerForm({
  initialData,
  isEdit = false,
}: Props) {
    const router = useRouter();

 const [formData, setFormData] = useState({
  customerName: initialData?.customerName || "",
  contactPerson: initialData?.contactPerson || "",
  mobile: initialData?.mobile || "",
  email: initialData?.email || "",
  gstNumber: initialData?.gstNumber || "",
  panNumber: initialData?.panNumber || "",
  address: initialData?.address || "",
  city: initialData?.city || "",
  state: initialData?.state || "",
  creditLimit: initialData?.creditLimit?.toString() || "",
  paymentTerms: initialData?.paymentTerms?.toString() || "",
});

const handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement
  >
) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  try {
    const payload = {
      ...formData,
      creditLimit: formData.creditLimit,
      paymentTerms: Number(formData.paymentTerms),
    };

    if (isEdit && initialData) {
      await updateCustomer(initialData.id, payload);

      alert("Customer Updated Successfully");
    } else {
      await createCustomer(payload);

      alert("Customer Created Successfully");
    }

    router.push("/dashboard/customer");

  } catch (error: any) {
    console.log(error.response?.data);
    alert(error.response?.data?.message);
  }
};

  return (
    <form
  onSubmit={handleSubmit}
  className="space-y-6 rounded-xl bg-white p-6 shadow"
>

      <h2 className="text-2xl font-bold">
        {isEdit ? "Edit Customer" : "Customer Details"}
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <div>
          <label className="mb-2 block font-medium">
            Customer Name
          </label>

          <input
  name="customerName"
  value={formData.customerName}
  onChange={handleChange}
  className="w-full rounded-lg border px-4 py-3"
  placeholder="Enter Customer Name"
/>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Contact Person
          </label>

          <input
  name="contactPerson"
  value={formData.contactPerson}
  onChange={handleChange}
  className="w-full rounded-lg border px-4 py-3"
  placeholder="Enter Contact Person"
/>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Mobile
          </label>

           <input
  name="mobile"
  value={formData.mobile}
  onChange={handleChange}
  className="w-full rounded-lg border px-4 py-3"
  placeholder="9876543210"
/>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Email
          </label>

          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
            placeholder="abc@gmail.com"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            GST Number
          </label>

          <input
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            PAN Number
          </label>

          <input
            name="panNumber"
            value={formData.panNumber}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block font-medium">
            Address
          </label>

          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border px-4 py-3"
          />
            
        </div>

        <div>
          <label className="mb-2 block font-medium">
            City
          </label>

          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            State
          </label>

          <input
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Credit Limit
          </label>

          <input
            name="creditLimit"
            value={formData.creditLimit}
            onChange={handleChange}
            type="number"
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Payment Terms
          </label>

          <input
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            type="number"
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

      </div>

      <div className="flex justify-end gap-3">

        <button
          type="button"
          className="rounded-lg border px-5 py-3"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          {isEdit ? "Update Customer" : "Save Customer"}
        </button>

      </div>

    </form>
  );
}
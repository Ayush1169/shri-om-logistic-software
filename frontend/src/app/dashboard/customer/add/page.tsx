import CustomerForm from "@/components/customer/CustomerForm";

export default function AddCustomerPage() {
  return (
    <div className="p-6">

      <h1 className="mb-6 text-3xl font-bold">
        Add Customer
      </h1>

      <CustomerForm />

    </div>
  );
}
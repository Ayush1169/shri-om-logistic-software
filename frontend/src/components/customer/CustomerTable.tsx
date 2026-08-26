import { Customer } from "@/types/customer";
import CustomerStatusBadge from "./CustomerStatusBadge";
import CustomerActionMenu from "./CustomerActionMenu";

type Props = {
  customers: Customer[];
  onStatus: (id: number) => void;
};

export default function CustomerTable({
  customers,
  onStatus,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Code
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Customer
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Contact Person
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Mobile
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                City
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Credit Limit
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Status
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  {customer.customerCode}
                </td>

                <td className="px-6 py-4 font-medium">
                  {customer.customerName}
                </td>

                <td className="px-6 py-4">
                  {customer.contactPerson}
                </td>

                <td className="px-6 py-4">
                  {customer.mobile}
                </td>

                <td className="px-6 py-4">
                  {customer.city}
                </td>

                <td className="px-6 py-4">
                  ₹{customer.creditLimit}
                </td>

                <td className="px-6 py-4">
                  <CustomerStatusBadge
                    isActive={customer.isActive}
                  />
                </td>

                <td className="px-6 py-4">
                 <CustomerActionMenu
  customer={customer}
  onView={() => {}}
  onEdit={() => {}}
  onStatus={() => onStatus(customer.id)}
/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {customers.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No Customers Found
          </div>
        )}
      </div>
    </div>
  );
}
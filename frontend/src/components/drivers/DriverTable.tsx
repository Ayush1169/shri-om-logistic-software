import { Driver } from "@/types/driver";
import DriverStatusBadge from "./DriverStatusBadge";
import DriverActionMenu from "./DriverActionMenu";

type Props = {
  drivers: Driver[];
  onStatus: (id: number) => void;
};

export default function DriverTable({
  drivers,
  onStatus,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Driver Name
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Mobile
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Aadhaar No.
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                License No.
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Company
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
            {drivers.map((driver) => (
              <tr
                key={driver.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium">
                  {driver.driverName}
                </td>

                <td className="px-6 py-4">
                  {driver.mobile}
                </td>

                <td className="px-6 py-4">
                  {driver.aadhaarNumber}
                </td>

                <td className="px-6 py-4">
                  {driver.licenseNumber}
                </td>

                <td className="px-6 py-4">
                  {driver.company?.companyName || "-"}
                </td>

                <td className="px-6 py-4">
                  <DriverStatusBadge
                    isActive={driver.isActive}
                  />
                </td>

                <td className="px-6 py-4">
                  <DriverActionMenu
                    driver={driver}
                    onView={() => {}}
                    onEdit={() => {}}
                    onStatus={() => onStatus(driver.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {drivers.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No Drivers Found
          </div>
        )}
      </div>
    </div>
  );
}
import { Vehicle } from "@/types/vehicle";
import VehicleStatusBadge from "./VehicleStatusBadge";
import VehicleActionMenu from "./VehicleActionMenu";

type Props = {
  vehicles: Vehicle[];
  onStatus: (id: number) => void;
};

export default function VehicleTable({
  vehicles,
  onStatus,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Vehicle No.
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Owner
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Type
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Capacity
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                GPS No.
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
            {vehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium">
                  {vehicle.vehicleNumber}
                </td>

                <td className="px-6 py-4">
                  {vehicle.ownerName}
                </td>

                <td className="px-6 py-4">
                  {vehicle.vehicleType}
                </td>

                <td className="px-6 py-4">
                  {vehicle.capacity}
                </td>

                <td className="px-6 py-4">
                  {vehicle.gpsNumber || "-"}
                </td>

                <td className="px-6 py-4">
                  <VehicleStatusBadge
                    isActive={vehicle.isActive}
                  />
                </td>

                <td className="px-6 py-4">
                  <VehicleActionMenu
                    vehicle={vehicle}
                    onView={() => {}}
                    onEdit={() => {}}
                    onStatus={() => onStatus(vehicle.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {vehicles.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No Vehicles Found
          </div>
        )}
      </div>
    </div>
  );
}
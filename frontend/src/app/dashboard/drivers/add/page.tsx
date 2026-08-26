import DriverForm from "@/components/drivers/DriverForm";

export default function AddDriverPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Add Driver
        </h1>

        <p className="mt-1 text-gray-500">
          Create a new driver.
        </p>
      </div>

      <DriverForm />
    </div>
  );
}
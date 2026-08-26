import api from "@/lib/axios";
import {
  Vehicle,
  VehicleFormData,
} from "@/types/vehicle";

export const getVehicles = async (
  page = 1,
  search = ""
) => {
  const response = await api.get(
    `/vehicles?page=${page}&search=${search}`
  );

  return response.data;
};

export const createVehicle = async (
  data: Partial<VehicleFormData>
) => {
  const response = await api.post(
    "/vehicles",
    data
  );

  return response.data;
};

export const getVehicleById = async (id: number) => {
  const response = await api.get(`/vehicles/${id}`);

  return response.data;
};

export const updateVehicle = async (
  id: number,
  data: Partial<VehicleFormData>
) => {
  const response = await api.put(
    `/vehicles/${id}`,
    data
  );

  return response.data;
};

export const toggleVehicleStatus = async (id: number) => {
  const response = await api.patch(
    `/vehicles/${id}/status`
  );

  return response.data;
};
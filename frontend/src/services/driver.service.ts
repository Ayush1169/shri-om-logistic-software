import api from "@/lib/axios";
import {
  Driver,
  DriverFormData,
} from "@/types/driver";

export const getDrivers = async (
  page = 1,
  search = ""
) => {
  const response = await api.get(
    `/drivers?page=${page}&search=${search}`
  );

  return response.data;
};

export const createDriver = async (
  data: Partial<DriverFormData>
) => {
  const response = await api.post(
    "/drivers",
    data
  );

  return response.data;
};

export const getDriverById = async (id: number) => {
  const response = await api.get(
    `/drivers/${id}`
  );

  return response.data;
};

export const updateDriver = async (
  id: number,
  data: Partial<DriverFormData>
) => {
  const response = await api.put(
    `/drivers/${id}`,
    data
  );

  return response.data;
};

export const toggleDriverStatus = async (
  id: number
) => {
  const response = await api.patch(
    `/drivers/${id}/status`
  );

  return response.data;
};
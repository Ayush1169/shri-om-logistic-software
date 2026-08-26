import api from "@/lib/axios";
import {
  Customer,
  CustomerResponse,
} from "@/types/customer";

export const getCustomers = async (
  page = 1,
  search = "",
  limit = 1000
): Promise<CustomerResponse> => {
  const response = await api.get(
    `/customers?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
  );

  return response.data;
};

export const createCustomer = async (
  data: Partial<Customer>
) => {
  const response = await api.post(
    "/customers",
    data
  );

  return response.data;
};

export const getCustomerById = async (id: number) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const updateCustomer = async (
  id: number,
  data: Partial<Customer>
) => {
  const response = await api.put(
    `/customers/${id}`,
    data
  );

  return response.data;
};

export const toggleCustomerStatus = async (id: number) => {
  const response = await api.patch(`/customers/${id}/status`);

  return response.data;
};
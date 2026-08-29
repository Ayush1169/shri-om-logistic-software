import api from "@/lib/axios";
import {
  Bilty,
  BiltyListResponse,
  BiltyResponse,
} from "@/types/bilty";

/**
 * Get All Bilties
 */
export const getBilties = async (
  page = 1,
  search = "",
  limit = 10,
  biltyType = "PAKKA"
): Promise<BiltyListResponse> => {
  const { data } = await api.get("/bilties", {
    params: {
      page,
      limit,
      search,
      biltyType,
    },
  });

  return data;
};

/**
 * Get Bilty By Id
 */
export const getBiltyById = async (
  id: number | string
): Promise<BiltyResponse> => {
  const { data } = await api.get(`/bilties/${id}`);

  return data;
};

/**
 * Create Bilty
 */
export const createBilty = async (
  payload: Partial<Bilty>
): Promise<BiltyResponse> => {
  const { data } = await api.post("/bilties", payload);

  return data;
};

/**
 * Update Bilty
 */
export const updateBilty = async (
  id: number | string,
  payload: Partial<Bilty>
): Promise<BiltyResponse> => {
  const { data } = await api.put(`/bilties/${id}`, payload);

  return data;
};

/**
 * Delete Bilty
 */
export const deleteBilty = async (
  id: number | string
) => {
  const { data } = await api.delete(`/bilties/${id}`);

  return data;
};

/**
 * Delete all bilties of one challan
 */
export const deleteBiltiesByChallan = async (
  challanId: number
) => {
  const { data } = await api.delete(
    `/bilties/challan/${challanId}`
  );

  return data;
};
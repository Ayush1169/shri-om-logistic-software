import api from "./axios";

export interface ChallanPreviewRow {
  id: number;
  serialNo: number;

  biltyDate: string | null;
  lrNo: string | null;

  item: string | null;
  consigneeName: string | null;
  pMarka: string | null;

  weight: number | null;
  packages: number | null;
  freight: number | null;

  paymentType: string | null;

  imported: boolean;

  gst?: number | null;
  hamali?: number | null;
  loadingCharges?: number | null;
  unloadingCharges?: number | null;
  insuranceCharges?: number | null;

  chargeableWeight?: number | null;

  eWayBillNumber?: string | null;
  remarks?: string | null;
}

export interface Challan {
  id: number;
  challanNumber: string;
  challanDate: string;
  vehicleId: number | null;
  driverId: number | null;
  branchId: number;
  route: string | null;
  fileName: string;
  fileUrl: string;
  totalBilties: number;
  totalPackages: number;
  totalWeight: number | string;
  totalFreight: number | string;
  status: string;
}

export const uploadChallan = async (
  file: File,
  biltyType: "PAKKA" | "KACHHA"
) => {
  const formData = new FormData();

  formData.append("challan", file);
  formData.append("biltyType", biltyType);

  const response = await api.post(
    "/challans/upload",
    formData
  );

  return response.data;
};

export const getChallanPreview = async (
  challanId: number
) => {
  const response = await api.get(
    `/challans/${challanId}/preview`
  );

  return response.data;
};

export interface ImportChallanItem {
  previewId: number;

  // Original challan values
  lrNo?: string | null;
  biltyDate?: string | null;

  consigneeId?: number | null;
  consigneeName?: string | null;

  pMarka?: string | null;

  goodsDescription?: string | null;

  destination?: string | null;

  paymentType?: string | null;

  packages?: number | null;
  weight?: number | null;
  freight?: number | null;

  gst?: number | null;
  hamali?: number | null;
  loadingCharges?: number | null;
  unloadingCharges?: number | null;
  insuranceCharges?: number | null;

  chargeableWeight?: number | null;

  eWayBillNumber?: string | null;

  remarks?: string | null;
}

export const importChallanBilties = async (
  challanId: number,
  items: ImportChallanItem[]
) => {
  const response = await api.post(
    `/challans/${challanId}/import`,
    {
      items,
    }
  );

  return response.data;
};
export type PaymentType = "PAID" | "TO_PAY" | "BILLING";

export type BiltyStatus =
  | "BOOKED"
  | "LOADED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export interface Branch {
  id: number;
  branchName: string;
}

export interface Customer {
  id: number;
  customerName: string;
}

export interface Vehicle {
  id: number;
  vehicleNumber: string;
}

export interface Driver {
  id: number;
  driverName: string;
}

export interface User {
  id: number;
  fullName: string;
}

export interface Bilty {
  id: number;

  biltyNumber: string;

  bookingDate: string;

  branchId: number;

  branch?: Branch;

  consignorId?: number | null;

  consignor?: Customer | null;

  consigneeId?: number | null;

  consignee?: Customer | null;

  // OCR / Challan imported consignee
  consigneeName?: string | null;

  // P.Marka from challan
  pMarka?: string | null;

  challanId?: number | null;

  vehicleId?: number | null;

  vehicle?: Vehicle | null;

  driverId?: number | null;

  driver?: Driver | null;

  pickupAddress?: string | null;

  deliveryAddress?: string | null;

  goodsDescription: string;

  packageCount: number;

  actualWeight?: number | null;

  chargeableWeight?: number | null;

  freight: number;

  gst?: number | null;

  hamali?: number | null;

  loadingCharges?: number | null;

  unloadingCharges?: number | null;

  insuranceCharges?: number | null;

  totalAmount: number;

  paymentType: PaymentType;

  eWayBillNumber?: string | null;

  remarks?: string | null;

  status: BiltyStatus;

  createdById: number;

  createdBy?: User;

  createdAt: string;

  updatedAt: string;
}

export interface BiltyResponse {
  success: boolean;
  data: Bilty;
}

export interface BiltyListResponse {
  success: boolean;
  bilties: Bilty[];
  total: number;
  page: number;
  totalPages: number;
}
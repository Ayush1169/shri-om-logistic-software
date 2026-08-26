export interface Customer {
  id: number;
  customerCode: string;
  customerName: string;
  gstNumber: string | null;
  panNumber: string | null;
  contactPerson: string | null;
  mobile: string;
  email: string | null;
  address: string;
  city: string;
  state: string;
  creditLimit: string;
  paymentTerms: number | null;
  branchId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  branch: {
    id: number;
    branchName: string;
  };
}

export interface CustomerResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  customers: Customer[];
}
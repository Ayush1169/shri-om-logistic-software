export interface DriverDocument {
  id?: number;
  driverId?: number;

  licenseExpiry: string;

  aadhaarFront: string;
  aadhaarBack: string;
  licenseImage: string;
}

export interface Driver {
  id: number;

  driverName: string;
  mobile: string;

  aadhaarNumber: string;
  licenseNumber: string;

  address: string;
  emergencyContact: string;

  companyId: number;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  company?: {
    id: number;
    companyName: string;
  };

  document?: DriverDocument;
}

export interface DriverFormData {
  driverName: string;
  mobile: string;

  aadhaarNumber: string;
  licenseNumber: string;

  address: string;
  emergencyContact: string;

  licenseExpiry: string;

  aadhaarFront: string;
  aadhaarBack: string;
  licenseImage: string;
}
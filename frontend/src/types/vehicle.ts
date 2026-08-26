export interface VehicleDocument {
  id?: number;
  vehicleId?: number;

  rcNumber: string;
  insuranceNumber: string;
  permitNumber: string;
  fitnessNumber: string;
  pollutionNumber: string;

  insuranceExpiry: string;
  permitExpiry: string;
  fitnessExpiry: string;
  pollutionExpiry: string;
}

export interface Vehicle {
  id: number;

  vehicleNumber: string;
  ownerName: string;
  vehicleType: string;
  capacity: number;
  gpsNumber: string;

  companyId: number;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  company?: {
    id: number;
    companyName: string;
  };

  document?: VehicleDocument;
}

export interface VehicleFormData {
  vehicleNumber: string;
  ownerName: string;
  vehicleType: string;
  capacity: number | "";

  gpsNumber: string;

  rcNumber: string;
  insuranceNumber: string;
  permitNumber: string;
  fitnessNumber: string;
  pollutionNumber: string;

  insuranceExpiry: string;
  permitExpiry: string;
  fitnessExpiry: string;
  pollutionExpiry: string;
}
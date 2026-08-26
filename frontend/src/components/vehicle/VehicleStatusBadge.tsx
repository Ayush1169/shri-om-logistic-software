import Chip from "@mui/material/Chip";

interface VehicleStatusBadgeProps {
  isActive: boolean;
}

export default function VehicleStatusBadge({
  isActive,
}: VehicleStatusBadgeProps) {
  return (
    <Chip
      label={isActive ? "Active" : "Inactive"}
      color={isActive ? "success" : "error"}
      size="small"
      variant="filled"
    />
  );
}
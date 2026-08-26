import {
  getAllVehiclesService,
  createVehicleService,
  getVehicleByIdService,
  updateVehicleService,
  toggleVehicleStatusService,
} from "../services/vehicle.service.js";

export async function getAllVehicles(req, res) {
  try {
    const result = await getAllVehiclesService(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function createVehicle(req, res) {
  try {
    const result = await createVehicleService(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getVehicleById(req, res) {
  try {
    const result = await getVehicleByIdService(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}
export async function updateVehicle(req, res) {
  try {
    const result = await updateVehicleService(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function toggleVehicleStatus(req, res) {
  try {
    const result = await toggleVehicleStatusService(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
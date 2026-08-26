import {
  getAllDriversService,
  createDriverService,
  getDriverByIdService,
  updateDriverService,
  toggleDriverStatusService,
} from "../services/driver.service.js";

export async function getAllDrivers(req, res) {
  try {
    const result = await getAllDriversService(req.query);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function createDriver(req, res) {
  try {
    const result = await createDriverService(req.body, req.user);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getDriverById(req, res) {
  try {
    const result = await getDriverByIdService(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateDriver(req, res) {
  try {
    const result = await updateDriverService(req.params.id, req.body);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function toggleDriverStatus(req, res) {
  try {
    const result = await toggleDriverStatusService(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}
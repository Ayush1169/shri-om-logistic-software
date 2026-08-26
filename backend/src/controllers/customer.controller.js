import { getAllCustomersService,
      createCustomerService,
      getCustomerByIdService,
      updateCustomerService,
      toggleCustomerStatusService,
     } from "../services/customer.service.js";

export async function getAllCustomers(req, res) {
  try {
    const result = await getAllCustomersService(req.query);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function createCustomer(req, res) {
  try {
    const result = await createCustomerService(
      req.body,
      req.user
    );

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getCustomerById(req, res) {
  try {
    const result = await getCustomerByIdService(req.params.id);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateCustomer(req, res) {
  try {
    const result = await updateCustomerService(
      req.params.id,
      req.body
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function toggleCustomerStatus(req, res) {
  try {
    const result = await toggleCustomerStatusService(
      req.params.id
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
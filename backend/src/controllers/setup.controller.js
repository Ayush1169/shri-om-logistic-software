import { createSuperAdminService } from "../services/setup.service.js";

export async function createSuperAdmin(req, res) {

  console.log("========= HEADERS =========");
  console.log(req.headers);
  console.log("===========================");

  try {
    const result = await createSuperAdminService(req.body, req.headers);

    return res.status(201).json(result);

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
import { loginService, getCurrentUserService } from "../services/auth.service.js";

export async function login(req, res) {
  try {
    const result = await loginService(req.body);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getCurrentUser(req, res) {
  try {
    const result = await getCurrentUserService(req.user.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
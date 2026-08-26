import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { validateCreateSuperAdmin } from "../validators/setup.validator.js";

export async function createSuperAdminService(data, headers) {

    console.log("Header Key:", headers["x-setup-key"]);
    console.log("ENV Key:", process.env.SETUP_KEY);
  // Secret Key Check
  if (headers["x-setup-key"] !== process.env.SETUP_KEY) {
    throw new Error("Unauthorized Setup Request");
  }

  validateCreateSuperAdmin(data);

  const {
    fullName,
    username,
    password,
    companyName,
    branchName,
    mobile,
    email,
  } = data;

  // Username check
  const existingUser = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (existingUser) {
    throw new Error("Username already exists.");
  }

  // Role
  const role = await prisma.role.upsert({
    where: {
      name: "SUPER_ADMIN",
    },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      description: "System Super Admin",
    },
  });

  // Company
  const company = await prisma.company.create({
    data: {
      companyName,
      address: "",
      city: "",
      state: "",
      mobile,
      email,
    },
  });

  // Branch
  const branch = await prisma.branch.create({
    data: {
      branchName,
      code: "HO",
      address: "",
      city: "",
      state: "",
      companyId: company.id,
    },
  });

  // Password Hash
  const hashedPassword = await bcrypt.hash(password, 10);

  // User
  const user = await prisma.user.create({
    data: {
      fullName,
      username,
      password: hashedPassword,
      email,
      mobile,
      roleId: role.id,
      branchId: branch.id,
    },
  });

  return {
    success: true,
    message: "Super Admin Created Successfully",
    userId: user.id,
  };
}
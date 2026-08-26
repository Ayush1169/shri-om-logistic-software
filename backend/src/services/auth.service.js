import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { generateToken } from "../utils/generateToken.js";

export async function loginService(data) {
  const { username, password } = data;

  if (!username || !password) {
    throw new Error("Username and Password are required.");
  }

  const user = await prisma.user.findUnique({
  where: {
    username,
  },
  include: {
    role: true,
    branch: {
      include: {
        company: true,
      },
    },
  },
});

  if (!user) {
    throw new Error("Invalid Username or Password.");
  }

  if (!user.isActive) {
    throw new Error("User is inactive.");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid Username or Password.");
  }

  const token = generateToken(user);

  return {
    success: true,
    message: "Login Successful",
    token,

    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role.name,
      branch: user.branch.branchName,
      companyId: user.branch.companyId,
    },
  };
}

export async function getCurrentUserService(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      role: true,
      branch: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role.name,
      branch: user.branch.branchName,
    },
  };
}


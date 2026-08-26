import jwt from "jsonwebtoken";

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      roleId: user.roleId,
      branchId: user.branchId,
      companyId: user.branch.companyId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}
export function validateCreateSuperAdmin(data) {
  const {
    fullName,
    username,
    password,
    companyName,
    branchName,
    mobile,
    email,
  } = data;

  if (
    !fullName ||
    !username ||
    !password ||
    !companyName ||
    !branchName ||
    !mobile ||
    !email
  ) {
    throw new Error("All fields are required.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  return true;
}
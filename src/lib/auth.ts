import bcrypt from 'bcrypt';

// Hash the password before saving to DB
export async function hashPassword(password: string) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password during login
export async function verifyPassword(inputPassword: string, hashedPassword: string) {
  return await bcrypt.compare(inputPassword, hashedPassword);
}

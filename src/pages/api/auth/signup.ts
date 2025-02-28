import type { NextApiRequest, NextApiResponse } from "next";
import { hashPassword } from "@/lib/auth";
import { createUser, getUserByEmail } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long" });
  }

  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      role: "user", // Default role
    });

    // Return success but don't include the password
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

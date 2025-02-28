import bcrypt from "bcrypt";

const hashPhotographerPassword = await bcrypt.hash("photo", 10);
const hashClientPassword = await bcrypt.hash("client", 10);

// Placeholder function for fetching a user by email
// Replace this with your actual DB connection logic

const mockUsers = [
  {
    id: "1",
    email: "photographer@example.com",
    password: hashPhotographerPassword, // Replace with a real hash
    role: "photographer",
    name: "Sample Photographer",
  },
  {
    id: "2",
    email: "client@example.com",
    password: hashClientPassword, // Replace with a real hash
    role: "client",
    name: "Sample Client",
  },
];

export async function getUserByEmail(email: string) {
  return mockUsers.find((user) => user.email === email);
}

// Function to create a new user
export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  // In a real application, this would insert into a database
  // For this mock implementation, we'll just add to our array

  // Generate a unique ID (in a real app, the DB would do this)
  const newId = (mockUsers.length + 1).toString();

  const newUser = {
    id: newId,
    ...userData,
  };

  mockUsers.push(newUser);

  return newUser;
}

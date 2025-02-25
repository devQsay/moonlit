import bcrypt  from 'bcrypt';


const hashPhotographerPassword = await bcrypt.hash('photo', 10);
const hashClientPassword = await bcrypt.hash('client', 10);

// Placeholder function for fetching a user by email
// Replace this with your actual DB connection logic

const mockUsers = [
  {
    id: '1',
    email: 'photographer@example.com',
    password: hashPhotographerPassword, // Replace with a real hash
    role: 'photographer',
  },
  {
    id: '2',
    email: 'client@example.com',
    password: hashClientPassword, // Replace with a real hash
    role: 'client',
  },
];

export async function getUserByEmail(email: string) {
  return mockUsers.find((user) => user.email === email);
}
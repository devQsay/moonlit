import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/auth';
import { getUserByEmail } from '@/lib/db';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Missing email or password');
        }

        // Find the user in the database
        const user = await getUserByEmail(credentials.email);

        if (!user) {
          throw new Error('No user found with this email');
        }

        // Verify the password
        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Incorrect password');
        }

        // Return user object (will be stored in the session)
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

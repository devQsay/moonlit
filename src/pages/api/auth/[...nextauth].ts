import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";

// Extend the JWT type to include our custom fields
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

// Extend the Session type to include our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      email?: string;
      role?: string;
    };
  }
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // Find the user in the database
        const user = await getUserByEmail(credentials.email);

        if (!user) {
          return null;
        }

        // Verify the password
        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        // Return user object (will be stored in the session)
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  session: {
    strategy: "jwt",
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
        session.user = {
          ...session.user,
          id: token.sub || "",
          role: (token.role as string) || "",
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

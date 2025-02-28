import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: string; // ✅ Ensure role is included
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }

  interface JWT {
    id: string;
    role: string;
  }
}

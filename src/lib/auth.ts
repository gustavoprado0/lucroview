import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "database",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
      
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
      
        if (!user) return null;
      
        if (!user.password) {
          throw new Error("Use login com Google");
        }
      
        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        );
      
        if (!valid) return null;
      
        return user;
      }
    }),
  ],

  pages: {
    signIn: "/login",
  },
};
import NextAuth from "next-auth";
import options from "@/auth/options"

export const { handlers, signIn, signOut, auth } = NextAuth(options);
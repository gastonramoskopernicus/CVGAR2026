import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isAuthorized } from "../../../lib/authConfig";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (isAuthorized(user?.email)) {
        return true;
      }
      return false; 
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    // optional: add custom sign in / error pages
    // error: '/auth/error', // Error code passed in query string as ?error=
  }
});

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { AUTHORIZED_EMAIL } from "../../../data/privateApps";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow only specific email to sign in
      if (user?.email?.toLowerCase() === AUTHORIZED_EMAIL.toLowerCase()) {
        return true;
      } else {
        // Return false to display a default error page, 
        // or return a URL string to redirect to a custom error page.
        // For now, this redirects to the default "Access Denied" page from NextAuth.
        return false; 
      }
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

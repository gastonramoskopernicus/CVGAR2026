import GoogleProvider from "next-auth/providers/google";

// Verify essential variables for production deployment strictly
const missingVars = [];
if (!process.env.GOOGLE_CLIENT_ID) missingVars.push("GOOGLE_CLIENT_ID");
if (!process.env.GOOGLE_CLIENT_SECRET) missingVars.push("GOOGLE_CLIENT_SECRET");
if (!process.env.NEXTAUTH_SECRET) missingVars.push("NEXTAUTH_SECRET");
if (!process.env.NEXTAUTH_URL) missingVars.push("NEXTAUTH_URL");
if (!process.env.AUTHORIZED_EMAIL) missingVars.push("AUTHORIZED_EMAIL");

if (missingVars.length > 0) {
  console.error("⛔ NEXTAUTH CONFIG ERROR: Missing the following environment variables:", missingVars.join(", "));
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      const authorized = (process.env.AUTHORIZED_EMAIL || "").toLowerCase().trim();
      const incoming = (user?.email || "").toLowerCase().trim();
      
      console.log(`[NextAuth debug] Incoming sign-in request from: ${incoming}`);
      
      if (incoming === authorized && authorized !== "") {
        return true; // Authorize
      }
      
      console.warn(`[NextAuth warning] Access denied for email: ${incoming}`);
      return false; // Display generic Access Denied to unauthorized
    },
  },
  debug: true, // Output verbose debug logs (temp)
};

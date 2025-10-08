// File Path: app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"

// THE FINAL FIX: Destructure the handlers first, then explicitly export GET and POST.
const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // The session callback signature is also different in v5
    async session({ session, user }) {
      // Add the user's ID from the database to the session object
      session.user.id = user.id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})

// Export the GET and POST handlers from the handlers object for Next.js
export const { GET, POST } = handlers

// Export the auth, signIn, and signOut functions for use in other parts of your app
export { auth, signIn, signOut }


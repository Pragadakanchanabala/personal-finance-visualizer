// File Path: lib/auth.js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// THE FIX: Use a namespace import for the adapter to prevent build errors.
import * as MongoDBAdapter from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const authOptions = {
  // Use the adapter from the imported namespace.
  adapter: MongoDBAdapter.MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### Final Step: Redeploy

1.  **Commit Your Changes**: Save the updated `lib/auth.js` file and commit it to your Git repository.
    ```bash
    git add lib/auth.js
    git commit -m "fix: Robustly import NextAuth adapter to fix build"
    git push
    


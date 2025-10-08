// File Path: lib/auth.js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// THE FIX: Use a direct named import for the adapter. This is the correct syntax.
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const authOptions = {
  // Use the adapter directly.
  adapter: MongoDBAdapter(clientPromise),
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

Please follow these steps one last time. This will resolve the build error.

1.  **Update the File**: Replace the code in your `lib/auth.js` file with the corrected version above.
2.  **Commit Your Changes**: Save the file and commit it to your Git repository.
    ```bash
    git add lib/auth.js
    git commit -m "fix(auth): correct MongoDBAdapter import for production build"
    git push
    


// This file is currently disabled to prevent NextAuth library from triggering 
// Pages Router prerendering check errors in Next.js 15.
// The application utilizes a robust client-side state AuthContext.tsx for authentication mapping.

export const handlers = {
  GET: () => new Response("NextAuth disabled"),
  POST: () => new Response("NextAuth disabled")
};

export const signIn = async () => {};
export const signOut = async () => {};
export const auth = async () => null;

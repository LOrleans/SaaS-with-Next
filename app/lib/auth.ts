import { FirestoreAdapter } from "@auth/firebase-adapter";
import NextAuth from "next-auth";
import { firebaseCert } from "./firebase";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: FirestoreAdapter({
    credential: firebaseCert,
  }),
  providers: [Google],
  events: {},
  callbacks: {},
})
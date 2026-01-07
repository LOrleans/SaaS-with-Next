"use server"

import { db } from "@/app/lib/firebase"

export async function verifyLink(link: string){
  const snapshot = await db.collection("profiles").doc(link).get()
  return snapshot.exists
}
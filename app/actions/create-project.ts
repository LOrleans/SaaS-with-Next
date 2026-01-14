"use server";

import { randomUUID } from "crypto";
import { db, storage } from "../lib/firebase";
import { auth } from "../lib/auth";
import { Timestamp } from "firebase-admin/firestore";

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session) return;

  const profileId = formData.get("profileId") as string;
  const projectName = formData.get("projectName") as string;
  const projectDescription = formData.get("projectDescription") as string;
  const projectUrl = formData.get("projectUrl") as string;
  const file = formData.get("file") as File;

  const generatedId = randomUUID();

  const storageRef = storage.file(`project-images/${profileId}/${generatedId}`);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await storageRef.save(buffer);

  const imagePath = storageRef.name;

  try {
    return await db
      .collection("profiles")
      .doc(profileId)
      .collection("projects")
      .doc()
      .set({
        userId: session.user?.id,
        projectName,
        projectDescription,
        projectUrl,
        imagePath,
        createdAt: Timestamp.now().toMillis(),
      });

  } catch (error) {
    console.error(error);
    return false;
  }
}

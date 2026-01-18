"use server";

import connectDB from "@/lib/db";
import { Application } from "@/lib/database/models";
import { revalidatePath } from "next/cache";

export async function getApplications() {
  await connectDB();
  const apps = await Application.find({}).sort({ lastUpdated: -1 });
  return apps.map((a: any) => ({ ...a.toObject(), _id: a._id.toString() }));
}

export async function createApplication(formData: FormData) {
  await connectDB();
  await Application.create({
    company: formData.get("company"),
    role: formData.get("role"),
    salary: formData.get("salary"),
    status: "applied",
    notes: ""
  });
  revalidatePath("/career");
}

export async function updateStatus(id: string, newStatus: string) {
  await connectDB();
  await Application.findByIdAndUpdate(id, { status: newStatus, lastUpdated: Date.now() });
  revalidatePath("/career");
}

export async function deleteApplication(id: string) {
  await connectDB();
  await Application.findByIdAndDelete(id);
  revalidatePath("/career");
}
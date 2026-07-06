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
  const benefitsRaw = formData.get("benefits") as string;
  const benefits = benefitsRaw ? benefitsRaw.split(",").map(b => b.trim()).filter(Boolean) : [];

  await Application.create({
    company: formData.get("company"),
    role: formData.get("role"),
    salary: formData.get("salary"),
    status: formData.get("status") || "applied",
    notes: formData.get("notes") || "",
    recruiterName: formData.get("recruiterName"),
    recruiterEmail: formData.get("recruiterEmail"),
    companyUrl: formData.get("companyUrl"),
    location: formData.get("location"),
    workModel: formData.get("workModel") || "remote",
    interviews: formData.get("interviews") ? Number(formData.get("interviews")) : 0,
    feedback: formData.get("feedback"),
    offerDetails: formData.get("offerDetails"),
    referral: formData.get("referral"),
    deadline: formData.get("deadline") ? new Date(String(formData.get("deadline"))) : undefined,
    benefits
  });
  revalidatePath("/career");
}

export async function updateStatus(id: string, newStatus: string) {
  await connectDB();
  await Application.findByIdAndUpdate(id, { status: newStatus, lastUpdated: Date.now() });
  revalidatePath("/career");
}

export async function updateApplication(id: string, data: any) {
  await connectDB();
  await Application.findByIdAndUpdate(id, { ...data, lastUpdated: Date.now() });
  revalidatePath("/career");
}

export async function deleteApplication(id: string) {
  await connectDB();
  await Application.findByIdAndDelete(id);
  revalidatePath("/career");
}
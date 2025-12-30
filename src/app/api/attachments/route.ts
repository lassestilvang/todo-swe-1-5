import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/server";
import { attachments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const taskAttachments = await db
      .select()
      .from(attachments)
      .where(eq(attachments.taskId, parseInt(taskId)));

    return NextResponse.json(taskAttachments);
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json({ error: "Failed to fetch attachments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const taskId = formData.get("taskId") as string;
    const file = formData.get("file") as File;

    if (!taskId || !file) {
      return NextResponse.json({ error: "Task ID and file are required" }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/json",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = `${process.cwd()}/public/uploads`;
    try {
      await require('fs').promises.mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Save file to disk
    const filePath = `uploads/${fileName}`;
    const buffer = await file.arrayBuffer();
    await require('fs').promises.writeFile(`${process.cwd()}/public/${filePath}`, Buffer.from(buffer));

    // Save attachment record to database
    const [attachment] = await db.insert(attachments).values({
      taskId: parseInt(taskId),
      fileName,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      filePath,
      uploadedAt: Date.now(),
    }).returning();

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return NextResponse.json({ error: "Failed to upload attachment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get("id");

    if (!attachmentId) {
      return NextResponse.json({ error: "Attachment ID is required" }, { status: 400 });
    }

    // Get attachment record
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, parseInt(attachmentId)));

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    // Delete file from disk
    try {
      await require('fs').promises.unlink(`${process.cwd()}/public/${attachment.filePath}`);
    } catch (error) {
      console.error("Error deleting file:", error);
      // Continue even if file deletion fails
    }

    // Delete attachment record from database
    await db.delete(attachments).where(eq(attachments.id, parseInt(attachmentId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json({ error: "Failed to delete attachment" }, { status: 500 });
  }
}

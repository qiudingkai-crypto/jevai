import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { isDirectoryAdmin } from "@/lib/directory-admin";
import { prisma } from "@/lib/prisma";

function validWebUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return null;
    if (url.hostname === "localhost" || url.hostname.endsWith(".local")) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }
  if (!(await isDirectoryAdmin())) {
    return NextResponse.json({ error: "Only the directory owner can add websites." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const url = validWebUrl(input.url);
  const iconUrl = input.iconUrl ? validWebUrl(input.iconUrl) : null;

  if (!name || name.length > 100 || !description || description.length > 280 || !url || (input.iconUrl && !iconUrl)) {
    return NextResponse.json({ error: "Enter a name, an HTTPS website URL, a short description, and an optional HTTPS icon URL." }, { status: 400 });
  }

  try {
    await prisma.directoryWebsite.create({ data: { name, url, iconUrl, description } });
    const count = await prisma.directoryWebsite.count();
    return NextResponse.json({ page: Math.ceil(count / 12) }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "This website is already listed." }, { status: 409 });
    }
    console.error("[Directory] Failed to add website:", error);
    return NextResponse.json({ error: "Could not add the website." }, { status: 500 });
  }
}

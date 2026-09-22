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

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return "Please sign in first.";
  if (!(await isDirectoryAdmin())) return "Not authorized.";
  return null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return NextResponse.json({ error: err }, { status: 401 });

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const url = validWebUrl(body.url);
  const iconUrl = body.iconUrl ? validWebUrl(body.iconUrl) : null;

  if (!name || name.length > 100 || !description || description.length > 280 || !url) {
    return NextResponse.json({ error: "Name, URL, and description are required." }, { status: 400 });
  }

  try {
    await prisma.directoryWebsite.update({
      where: { id },
      data: { name, url, iconUrl, description },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "This URL is already listed." }, { status: 409 });
    }
    console.error("[Directory PUT]", e);
    return NextResponse.json({ error: "Failed to update." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return NextResponse.json({ error: err }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.directoryWebsite.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Directory DELETE]", e);
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}

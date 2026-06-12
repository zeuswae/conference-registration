import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildQrPayload, buildVerifyUrl, generateQrDataUrl } from "@/lib/qr";

const schema = z.object({
  eventId: z.string().min(1).max(50),
  attendeeName: z.string().trim().min(2).max(100),
  attendeeEmail: z.string().trim().email().max(150),
  organization: z.string().trim().max(150).optional(),
  paperTitle: z.string().trim().max(255).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());

    const event = await prisma.event.findUnique({
      where: { id: body.eventId },
      select: { id: true, active: true },
    });

    if (!event?.active) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const normalizedEmail = body.attendeeEmail.toLowerCase();

    const existing = await prisma.eventRegistration.findFirst({
      where: {
        eventId: body.eventId,
        OR: [
          { userId: session.id },
          { attendeeEmail: { equals: normalizedEmail, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You are already registered for this event." },
        { status: 409 },
      );
    }

    const qrCode = `REG-${uuidv4().slice(0, 8).toUpperCase()}`;

    const registration = await prisma.eventRegistration.create({
      data: {
        userId: session.id,
        eventId: body.eventId,
        type: "EARLY",
        status: "PENDING",
        qrCode,
        attendeeName: body.attendeeName,
        attendeeEmail: normalizedEmail,
        organization: body.organization || null,
        paperTitle: body.paperTitle || null,
      },
    });

    const qrDataUrl = await generateQrDataUrl(
      buildQrPayload(registration.id, registration.qrCode),
    );

    return NextResponse.json({
      ok: true,
      registration,
      qrDataUrl,
      verifyUrl: buildVerifyUrl(registration.qrCode),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, loginUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed-db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const failedAttempts = new Map<string, { count: number, lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; 

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email;

    const attemptRecord = failedAttempts.get(email);
    if (attemptRecord) {
       if (Date.now() < attemptRecord.lockedUntil) {
          return NextResponse.json(
            { error: "Account locked due to too many failed attempts. Try again in 15 minutes." },
            { status: 429 }
          );
       }
    }

    if ((await prisma.user.count()) === 0) {
      await seedDatabase();
    }

    try {
      const user = await loginUser(email, body.password);

      failedAttempts.delete(email);

      await createSession({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      return NextResponse.json({ ok: true });

    } catch (loginError) {
       const currentAttempts = (attemptRecord?.count || 0) + 1;

       if (currentAttempts >= MAX_ATTEMPTS) {
          failedAttempts.set(email, {
             count: currentAttempts,
             lockedUntil: Date.now() + LOCKOUT_DURATION_MS
          });
       } else {
          failedAttempts.set(email, {
             count: currentAttempts,
             lockedUntil: 0 
          });
       }

       throw loginError;
    }

  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please provide a valid email address and ensure all fields are correctly formatted." }, 
        { status: 400 }
      );
    }

    const msg = e instanceof Error ? e.message : "Registration failed";

    if (msg.includes("Prisma") || msg.includes("Unique constraint")) {
      console.error("Database Error:", msg); 
      return NextResponse.json(
        { error: "This email is already registered, or there is a system issue." }, 
        { status: 400 }
      );
    }

    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

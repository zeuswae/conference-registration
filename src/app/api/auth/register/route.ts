import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, registerUser } from "@/lib/auth";

const schema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address (e.g. you@example.com)"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters"),
  organization: z
    .string()
    .max(150, "Organization name must be under 150 characters")
    .optional(),
  phone: z
    .string()
    .max(13, "Phone number is too long")
    .regex(
      /^(09|\+639|639)\d{9}$/,
      "Phone number must start with 09, +639, or 639 followed by 9 digits"
    )
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const user = await registerUser(body);
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return NextResponse.json({ ok: true });

  } catch (e) {
    if (e instanceof z.ZodError) {
      const message = e.errors[0]?.message ?? "Please check your input and try again.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
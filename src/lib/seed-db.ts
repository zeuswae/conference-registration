import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function seedDatabase() {
  const adminHash = await bcrypt.hash("admin12345", 12);
  const userHash = await bcrypt.hash("user12345", 12);

  await prisma.user.upsert({
    where: { email: "admin@conference.local" },
    update: { passwordHash: adminHash, role: "ADMIN" },
    create: {
      email: "admin@conference.local",
      passwordHash: adminHash,
      name: "System Admin",
      role: "ADMIN",
      organization: "Conference Secretariat",
    },
  });

  await prisma.user.upsert({
    where: { email: "participant@conference.local" },
    update: { passwordHash: userHash },
    create: {
      email: "participant@conference.local",
      passwordHash: userHash,
      name: "Demo Participant",
      role: "USER",
      organization: "State University",
    },
  });

  await prisma.event.upsert({
    where: { id: "seed-event-2026" },
    update: {},
    create: {
      id: "seed-event-2026",
      name: "International Research Conference on Mechatronics 2026",
      description:
        "Annual research conference featuring plenary sessions, paper presentations, and industry forums.",
      venue: "Metro Convention Center",
      startDate: new Date("2026-09-15"),
      endDate: new Date("2026-09-17"),
      earlyDeadline: new Date("2026-07-31"),
      regularFee: 3500,
      earlyFee: 2500,
      isResearchConf: true,
      active: true,
    },
  });
}

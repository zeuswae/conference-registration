import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { MembershipForms } from "@/components/MembershipForms";

export default async function MembershipPage() {
  const session = await getSession();
  if (!session) return null;

  const memberships = await prisma.membership.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-8">
      <section>
        <p className="section-kicker">Membership</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Membership tracking</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Apply for membership, submit payment proof, and monitor renewal
          status for institutional, lifetime, individual, and certification records.
        </p>
      </section>
      <MembershipForms
        memberships={memberships.map((m) => ({
          id: m.id,
          memberId: m.memberId,
          type: m.type,
          status: m.status,
          expiryDate: m.expiryDate?.toISOString().slice(0, 10) ?? null,
          latestPaymentStatus: m.payments[0]?.status ?? null,
        }))}
      />
    </div>
  );
}

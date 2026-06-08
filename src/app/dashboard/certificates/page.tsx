import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CertificateRequestForm } from "@/components/CertificateRequestForm";
import { StatusBadge } from "@/components/StatusBadge";
import { EVENT_CERT_LABELS } from "@/lib/constants";

export default async function CertificatesPage() {
  const session = await getSession();
  if (!session) return null;

  const [events, requests] = await Promise.all([
    prisma.event.findMany({ where: { active: true }, select: { id: true, name: true } }),
    prisma.eventCertificateRequest.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <p className="section-kicker">Certificates</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Certificate requests</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Request and track participation, appearance, recognition, and
          presentation certificates for conference activities.
        </p>
      </section>

      <CertificateRequestForm eventOptions={events} />

      <section>
        <h2 className="mb-4 text-xl font-black text-slate-950">Your requests</h2>
        {requests.length === 0 ? (
          <div className="dashboard-card p-5 text-sm text-slate-600">
            No certificate requests yet. Submit a request above when you are ready.
          </div>
        ) : (
          <ul className="space-y-3">
            {requests.map((c) => (
              <li key={c.id} className="dashboard-card p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-slate-950">{EVENT_CERT_LABELS[c.type]}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-1 text-slate-600">{c.recipientName}</p>
                {c.paperTitle && <p className="text-slate-500">Paper: {c.paperTitle}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

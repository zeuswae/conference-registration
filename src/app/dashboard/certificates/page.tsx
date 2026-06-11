import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CertificateRequestForm } from "@/components/CertificateRequestForm";
import { StatusBadge } from "@/components/StatusBadge";
import { EVENT_CERT_LABELS } from "@/lib/constants";

function formatDate(value: Date | null) {
  if (!value) return "Not yet reviewed";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(value);
}

function certificateStatus(status: string) {
  return status === "ISSUED" ? "APPROVED" : status;
}

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

  const grouped = requests.reduce<
    Record<
      string,
      {
        title: string;
        recipientName: string;
        paperTitle: string | null;
        latestStatus: string;
        latestUpdatedAt: Date;
        approvedRequestId: string | null;
        logs: {
          id: string;
          status: string;
          createdAt: Date;
          updatedAt: Date;
          issuedAt: Date | null;
        }[];
      }
    >
  >((acc, request) => {
    const key = [request.type, request.recipientName, request.paperTitle ?? ""].join("|");
    const existing = acc[key];
    const status = certificateStatus(request.status);
    const log = {
      id: request.id,
      status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      issuedAt: request.issuedAt,
    };

    if (!existing) {
      acc[key] = {
        title: EVENT_CERT_LABELS[request.type],
        recipientName: request.recipientName,
        paperTitle: request.paperTitle,
        latestStatus: status,
        latestUpdatedAt: request.updatedAt,
        approvedRequestId: status === "APPROVED" ? request.id : null,
        logs: [log],
      };
      return acc;
    }

    existing.logs.push(log);
    if (request.updatedAt > existing.latestUpdatedAt) {
      existing.latestStatus = status;
      existing.latestUpdatedAt = request.updatedAt;
    }
    if (status === "APPROVED") {
      existing.approvedRequestId = request.id;
    }
    return acc;
  }, {});

  const certificateLogs = Object.values(grouped);

  return (
    <div className="space-y-8">
      <section>
        <p className="section-kicker">Certificates</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Certificates</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Request and track certificate progress in one organized log. Pending,
          approved, and rejected updates are grouped by certificate record.
        </p>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
        <CertificateRequestForm eventOptions={events} />

        <section className="min-w-0">
          <h2 className="mb-4 text-xl font-black text-slate-950">Your certificates</h2>
          {certificateLogs.length === 0 ? (
            <div className="dashboard-card p-5 text-sm text-slate-600">
              No certificate requests yet. Submit a request when you are ready.
            </div>
          ) : (
            <div className="max-h-[720px] space-y-4 overflow-y-auto pr-1">
              {certificateLogs.map((log) => (
                <article key={`${log.title}-${log.recipientName}-${log.paperTitle ?? ""}`} className="dashboard-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-slate-950">{log.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-600">{log.recipientName}</p>
                      {log.paperTitle && <p className="mt-1 text-xs text-slate-500">Paper: {log.paperTitle}</p>}
                    </div>
                    <StatusBadge status={log.latestStatus} />
                  </div>

                  <details className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <summary className="cursor-pointer text-sm font-black text-slate-700">
                      View status history
                    </summary>
                    <div className="mt-3 space-y-2">
                      {log.logs.map((entry) => (
                        <div key={entry.id} className="rounded-xl border border-slate-100 bg-white p-3 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <StatusBadge status={entry.status} />
                            <span className="font-semibold text-slate-500">Updated {formatDate(entry.updatedAt)}</span>
                          </div>
                          <p className="mt-2 text-slate-500">Requested {formatDate(entry.createdAt)}</p>
                          {entry.status === "APPROVED" && (
                            <p className="text-slate-500">Approved {formatDate(entry.issuedAt ?? entry.updatedAt)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>

                  {log.approvedRequestId && (
                    <a
                      href={`/api/certificates/event/${log.approvedRequestId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-md"
                    >
                      View certificate
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

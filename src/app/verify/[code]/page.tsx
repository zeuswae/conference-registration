import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckInButton } from "@/components/CheckInButton";

function getVerificationMessage(status: string) {
  switch (status) {
    case "APPROVED":
      return {
        className: "bg-emerald-50 text-emerald-700",
        text: "Paid and valid for event entry.",
      };

    case "PAYMENT_SUBMITTED":
      return {
        className: "bg-blue-50 text-blue-700",
        text: "Payment submitted. Waiting for admin verification.",
      };

    case "PENDING":
      return {
        className: "bg-amber-50 text-amber-700",
        text: "Pending payment. Not valid for entry yet.",
      };

    case "REJECTED":
      return {
        className: "bg-red-50 text-red-700",
        text: "Registration or payment rejected. Please contact the organizers.",
      };

    default:
      return {
        className: "bg-slate-50 text-slate-700",
        text: "Unknown registration status. Please contact the organizers.",
      };
  }
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const [{ code }, session] = await Promise.all([params, getSession()]);

  const reg = await prisma.eventRegistration.findUnique({
    where: { qrCode: code },
    include: {
      event: true,
      payment: {
        select: {
          status: true,
          reviewedAt: true,
        },
      },
    },
  });

  const verification = reg ? getVerificationMessage(reg.status) : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] p-6">
      <div className="glass-card w-full max-w-md rounded-3xl p-8">
        <p className="section-kicker">QR verification</p>

        <h1 className="mt-2 text-2xl font-black text-slate-950">
          Registration verification
        </h1>

        {!reg ? (
          <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            Invalid or unknown QR code.
          </p>
        ) : (
          <div className="mt-6 space-y-3 text-sm">
            <p>
              <span className="text-slate-500">Event:</span>{" "}
              <strong>{reg.event.name}</strong>
            </p>

            <p>
              <span className="text-slate-500">Attendee:</span>{" "}
              {reg.attendeeName}
            </p>

            {session?.role === "ADMIN" && (
              <p>
                <span className="text-slate-500">Email:</span>{" "}
                {reg.attendeeEmail}
              </p>
            )}

            <p>
              <span className="text-slate-500">Code:</span>{" "}
              <span className="font-mono">{reg.qrCode}</span>
            </p>

            <p>
              <span className="text-slate-500">Attendance:</span>{" "}
              <strong>{reg.checkedIn ? "Checked in" : "Not checked in"}</strong>
            </p>

            {session?.role === "ADMIN" && (
              <p>
                <span className="text-slate-500">Payment:</span>{" "}
                <strong>
                  {reg.payment?.status
                    ? reg.payment.status.replaceAll("_", " ")
                    : "NO PAYMENT"}
                </strong>
              </p>
            )}

            <StatusBadge status={reg.status} />

            {verification && (
              <p
                className={`mt-4 rounded-2xl p-4 font-bold ${verification.className}`}
              >
                {verification.text}
              </p>
            )}

            {session?.role === "ADMIN" && reg.status === "APPROVED" && (
              <CheckInButton
                registrationId={reg.id}
                checkedIn={reg.checkedIn}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

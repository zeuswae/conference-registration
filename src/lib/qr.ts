import QRCode from "qrcode";

export async function generateQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 280,
    margin: 2,
    color: { dark: "#1e1b4b", light: "#ffffff" },
  });
}

function getAppBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionUrl) return `https://${vercelProductionUrl}`.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`.replace(/\/$/, "");

  return "http://localhost:3000";
}

export function buildQrPayload(_registrationId: string, qrCode: string) {
  return `${getAppBaseUrl()}/verify/${qrCode}`;
}

export function buildVerifyUrl(qrCode: string) {
  return `${getAppBaseUrl()}/verify/${qrCode}`;
}

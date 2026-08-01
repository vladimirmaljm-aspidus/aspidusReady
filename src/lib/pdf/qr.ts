import QRCode from "qrcode";

/**
 * Generates a QR code as a data URL (base64 PNG).
 * The QR code encodes the public verification URL.
 */
export async function generateQrCodeDataUrl(verificationCode: string, baseUrl?: string): Promise<string> {
  const base = baseUrl || process.env.APP_BASE_URL || "http://localhost:3000";
  const url = `${base}/verify/${verificationCode}`;
  return QRCode.toDataURL(url, {
    width: 120,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}

/**
 * Generates a QR code as a base64 string (without the data: prefix).
 */
export async function generateQrCodeBase64(verificationCode: string, baseUrl?: string): Promise<string> {
  const dataUrl = await generateQrCodeDataUrl(verificationCode, baseUrl);
  return dataUrl.split(",")[1];
}

/**
 * Computes SHA-256 hash of a buffer (for PDF forensic verification).
 */
export async function computePdfHash(buffer: Buffer | Uint8Array): Promise<string> {
  const { createHash } = await import("crypto");
  const hash = createHash("sha256").update(buffer).digest("hex");
  return `sha256:${hash}`;
}

/**
 * Generates a unique verification code for a document.
 * Format: ASP-{TYPE}{YY}-{SEQ}-{RANDOM6}
 * Example: ASP-OF26-001-X7K2M9
 */
export function generateVerificationCode(docType: string, docNumber: string): string {
  const prefix = "ASP";
  const typeCode = docType === "offer" ? "OF" : docType === "invoice" ? "IV" : docType === "proforma" ? "PR" : "DC";
  const numPart = docNumber.replace(/[^0-9]/g, "").slice(-6).padStart(3, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${typeCode}${numPart.slice(-2)}-${numPart.slice(0, 3)}-${random}`;
}

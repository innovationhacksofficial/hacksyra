import { NextResponse, type NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { toDate } from "@/lib/domain/dates";
import type { Certificate } from "@/types";

export async function GET(_req: NextRequest, context: { params: Promise<{ serial: string }> }) {
  const { serial } = await context.params;
  const snap = await adminDb().collection(COLLECTIONS.CERTIFICATES).doc(serial).get();
  if (!snap.exists) {
    return NextResponse.json({ error: { code: "not_found", message: "Certificate not found." } }, { status: 404 });
  }
  const cert = snap.data() as Certificate;
  if (cert.isRevoked) {
    return NextResponse.json({ error: { code: "revoked", message: "This certificate has been revoked." } }, { status: 410 });
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  const blue = rgb(0.082, 0.396, 0.847); // #1565D8
  const dark = rgb(0.059, 0.09, 0.165);
  const muted = rgb(0.39, 0.45, 0.55);

  // Outer & inner borders
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: blue, borderWidth: 3 });
  page.drawRectangle({ x: 34, y: 34, width: width - 68, height: height - 68, borderColor: rgb(0.82, 0.88, 0.98), borderWidth: 1 });

  // Top header band
  page.drawRectangle({ x: 24, y: height - 110, width: width - 48, height: 86, color: blue });
  page.drawText("HACKSYRA  ·  INNOVATION HACKS", { x: 64, y: height - 68, size: 16, font: bold, color: rgb(1, 1, 1) });
  page.drawText("VERIFIED CERTIFICATE OF ACHIEVEMENT", { x: 64, y: height - 92, size: 11, font: regular, color: rgb(0.86, 0.91, 1) });

  // Main copy
  page.drawText("PROUDLY PRESENTED TO", { x: 64, y: height - 175, size: 11, font: bold, color: blue });
  page.drawText(cert.recipientName || "Participant", { x: 64, y: height - 225, size: 38, font: bold, color: dark });

  const roleLabel = cert.type.replace(/_/g, " ").toUpperCase();
  page.drawText(`For outstanding ${roleLabel} at`, { x: 64, y: height - 275, size: 15, font: regular, color: muted });
  page.drawText(cert.hackathonName || "HACKSYRA Hackathon", { x: 64, y: height - 315, size: 24, font: bold, color: dark });

  // Footer metadata
  const issuedDate = (toDate(cert.issuedAt) ?? new Date()).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  page.drawLine({ start: { x: 64, y: 140 }, end: { x: 290, y: 140 }, thickness: 1, color: rgb(0.8, 0.85, 0.92) });
  page.drawText(cert.issuedBy || "Innovation Hacks", { x: 64, y: 150, size: 14, font: bold, color: dark });
  page.drawText("Authorized Organizer", { x: 64, y: 120, size: 10, font: regular, color: muted });

  page.drawText(`Issued: ${issuedDate}`, { x: width - 320, y: 150, size: 11, font: regular, color: dark });
  page.drawText(`Serial: ${cert.serialNumber}`, { x: width - 320, y: 132, size: 11, font: bold, color: blue });
  page.drawText(`Verify: ${cert.verificationUrl || ""}`, { x: 64, y: 58, size: 9.5, font: regular, color: muted });

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="HACKSYRA-${cert.serialNumber}.pdf"`,
    },
  });
}


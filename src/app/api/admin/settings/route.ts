import { z } from "zod";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS, DOCS } from "@/lib/firebase/collections";
import { isValidListingFeePaise } from "@/lib/domain/admin-logic";
import { audit } from "@/lib/server/audit";
import { route, Errors } from "@/lib/server/api";

const Body = z.object({
  listingFeeInPaise: z.number().int().optional(),
  supportEmail: z.string().email().optional(),
  featureFlags: z.record(z.boolean()).optional(),
  categories: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).optional(),
});

export const PUT = route(
  { auth: ["admin", "super_admin"], body: Body, rateLimit: { limit: 20, windowSec: 60, name: "admin-settings" } },
  async ({ user, body, req }) => {
    if (body.listingFeeInPaise !== undefined && !isValidListingFeePaise(body.listingFeeInPaise)) {
      throw Errors.badRequest("Listing fee must be ₹0 or between ₹1 (100 paise) and ₹1,000 (100000 paise).");
    }
    await adminDb()
      .collection(COLLECTIONS.PLATFORM_SETTINGS)
      .doc(DOCS.PLATFORM_SETTINGS)
      .set(
        {
          ...body,
          listingFeeCurrency: "INR",
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: user!.uid,
        },
        { merge: true }
      );
    await audit({ actorId: user!.uid, actorEmail: user!.email, action: "platform.settings_updated", resource: "platformSettings", resourceId: DOCS.PLATFORM_SETTINGS, metadata: body, req });
    return { ok: true };
  }
);


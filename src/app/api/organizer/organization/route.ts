import { z } from "zod";
import { nanoid } from "nanoid";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { slugify } from "@/lib/domain/slug";
import { route, Errors } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { notifyAdmins } from "@/lib/server/notify";

const Body = z.object({
  name: z.string().trim().min(2).max(100),
  type: z.enum(["college", "university", "company", "startup", "community", "nonprofit", "individual"]),
  website: z.string().trim().url().optional().or(z.literal("")),
  contactEmail: z.string().trim().email(),
  country: z.string().trim().min(2).max(60),
  description: z.string().trim().max(1000).optional(),
  submitForVerification: z.boolean().optional(),
});

/** POST /api/organizer/organization — creates or updates the user's primary organization & optionally submits verification. */
export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 15, windowSec: 60, name: "org-upsert" } },
  async ({ user, body, req }) => {
    const db = adminDb();
    const existing = await db.collection(COLLECTIONS.ORGANIZATIONS).where("ownerId", "==", user!.uid).limit(1).get();
    const now = FieldValue.serverTimestamp();

    if (existing.empty) {
      const id = `org_${nanoid(12)}`;
      const slug = `${slugify(body.name) || "org"}-${nanoid(4).toLowerCase()}`;
      const status = body.submitForVerification ? "pending" : "unverified";
      await db.collection(COLLECTIONS.ORGANIZATIONS).doc(id).set({
        id,
        name: body.name,
        slug,
        type: body.type,
        website: body.website || null,
        contactEmail: body.contactEmail,
        country: body.country,
        description: body.description || "",
        socialLinks: [],
        ownerId: user!.uid,
        memberIds: [user!.uid],
        verificationStatus: status,
        isActive: true,
        hackathonsHosted: 0,
        createdAt: now,
        updatedAt: now,
      });
      await audit({ actorId: user!.uid, action: "organization.created", resource: "organizations", resourceId: id, req });
      if (status === "pending") {
        await notifyAdmins({
          type: "system",
          title: "Organization verification requested",
          message: `${body.name} requested organizer verification.`,
          linkUrl: "/admin/organizations",
        });
      }
      return { id, verificationStatus: status };
    }

    const ref = existing.docs[0].ref;
    const prev = existing.docs[0].data();
    const nextStatus =
      body.submitForVerification && prev.verificationStatus !== "verified"
        ? "pending"
        : prev.verificationStatus;

    if (prev.verificationStatus === "suspended") {
      throw Errors.forbidden("This organization is currently suspended.");
    }

    await ref.update({
      name: body.name,
      type: body.type,
      website: body.website || null,
      contactEmail: body.contactEmail,
      country: body.country,
      description: body.description || "",
      verificationStatus: nextStatus,
      updatedAt: now,
    });
    await audit({ actorId: user!.uid, action: "organization.updated", resource: "organizations", resourceId: ref.id, req });
    if (body.submitForVerification && prev.verificationStatus !== "pending" && nextStatus === "pending") {
      await notifyAdmins({
        type: "system",
        title: "Organization verification requested",
        message: `${body.name} requested organizer verification.`,
        linkUrl: "/admin/organizations",
      });
    }
    return { id: ref.id, verificationStatus: nextStatus };
  }
);


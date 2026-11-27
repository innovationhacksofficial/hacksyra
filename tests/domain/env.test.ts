import { describe, expect, it } from "vitest";
import { isRealValue } from "@/lib/env";

describe("env placeholder detection", () => {
  it("rejects template placeholders cleanly", () => {
    expect(isRealValue("")).toBe(false);
    expect(isRealValue(undefined)).toBe(false);
    expect(isRealValue("your-firebase-api-key")).toBe(false);
    expect(isRealValue("firebase-adminsdk@your-project.iam.gserviceaccount.com")).toBe(false);
    expect(isRealValue("-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n")).toBe(false);
    expect(isRealValue("rzp_test_your_key_id")).toBe(false);
    expect(isRealValue("rzp_test_xxxxxxxxxxxxxxxx")).toBe(false);
  });

  it("accepts real Firebase and Razorpay identifiers", () => {
    expect(isRealValue("hacksyra-3da31")).toBe(true);
    expect(isRealValue("AIzaSySampleKeyValue123456789ABCDEF")).toBe(true);
    expect(isRealValue("firebase-adminsdk-abcde@hacksyra-3da31.iam.gserviceaccount.com")).toBe(true);
  });
});

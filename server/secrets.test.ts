import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("Environment Secrets Validation", () => {
  it("should have Amazon Associate ID configured", () => {
    expect(ENV.amazonAssociateId).toBe("homestore0ba-20");
  });

  it("should have Pinterest Account ID configured", () => {
    expect(ENV.pinterestAccountId).toBe("homestore0315");
  });

  it("should have automation schedule cron configured", () => {
    expect(ENV.automationScheduleCron).toBe("0 9 * * *");
  });

  it("should have placeholder or real Amazon API keys", () => {
    // These can be placeholders initially
    expect(ENV.amazonAccessKeyId).toBeDefined();
    expect(ENV.amazonSecretKey).toBeDefined();
  });

  it("should have placeholder or real Pinterest API token", () => {
    // This can be a placeholder initially
    expect(ENV.pinterestAccessToken).toBeDefined();
  });
});

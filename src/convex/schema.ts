import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Spill severity levels
export const SEVERITY_LEVELS = {
  LOW: "low",
  MODERATE: "moderate",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export const severityValidator = v.union(
  v.literal(SEVERITY_LEVELS.LOW),
  v.literal(SEVERITY_LEVELS.MODERATE),
  v.literal(SEVERITY_LEVELS.HIGH),
  v.literal(SEVERITY_LEVELS.CRITICAL),
);

export type Severity = Infer<typeof severityValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    // Oil spill detections
    detections: defineTable({
      userId: v.id("users"),
      imageStorageId: v.id("_storage"),
      imageUrl: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed")
      ),
      spillDetected: v.boolean(),
      confidenceScore: v.optional(v.number()),
      areaSqKm: v.optional(v.number()),
      spillCoordinates: v.optional(
        v.array(
          v.object({
            x: v.number(),
            y: v.number(),
            severity: severityValidator,
          })
        )
      ),
      environmentalImpact: v.optional(v.string()),
      analysisData: v.optional(v.any()),
      errorMessage: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"]),

    // Analysis reports
    reports: defineTable({
      detectionId: v.id("detections"),
      userId: v.id("users"),
      reportData: v.object({
        detectedArea: v.number(),
        severityDistribution: v.object({
          low: v.number(),
          moderate: v.number(),
          high: v.number(),
          critical: v.number(),
        }),
        environmentalImpact: v.string(),
        recommendations: v.array(v.string()),
      }),
      generatedAt: v.number(),
    })
      .index("by_detection", ["detectionId"])
      .index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  }
);

export default schema;